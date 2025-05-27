const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return comment correctly', async () => {
      // Arrange
      const mockComment = {
        owner: 'user-123',
        thread_id: 'thread-123',
        date: new Date().toISOString(),
        content: 'content',
      };
      await UsersTableTestHelper.addUser({ id: mockComment.owner });
      await ThreadsTableTestHelper.addThread({ id: mockComment.thread_id, owner: mockComment.owner });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(mockComment);

      // Assert
      const addedComment = await CommentsTableTestHelper.getCommentById('comment-123');
      expect(addedComment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const mockComment = {
        owner: 'user-123',
        thread_id: 'thread-123',
        date: new Date().toISOString(),
        content: 'content',
      };
      await UsersTableTestHelper.addUser({ id: mockComment.owner });
      await ThreadsTableTestHelper.addThread({ id: mockComment.thread_id, owner: mockComment.owner });
      const fakeIdGenerator = () => '123'; //stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepositoryPostgres.addComment(mockComment);

      // Assert
      expect(result).toStrictEqual({
        id: 'comment-123',
        content: 'content',
        owner: 'user-123',
      });
    });
  });
});
