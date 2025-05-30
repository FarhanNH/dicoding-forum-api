const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

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
    it('should throw error when payload not contain needed property', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      const invalidPayloads = [
        { thread_id: 'thread-123', content: 'content' },
        { owner: 'user-123', content: 'content' },
        { owner: 'user-123', thread_id: 'thread-123' },
      ];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(commentRepository.addComment(payload)).rejects.toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        })
      );
    });

    it('should throw error when payload not meet data type specification', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');
      const invalidPayloads = [
        { owner: 123, thread_id: 'thread-123', content: 'content' },
        { owner: 'user-123', thread_id: 123, content: 'content' },
        { owner: 'user-123', thread_id: 'thread-123', content: 123 },
      ];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(commentRepository.addComment(payload)).rejects.toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        })
      );
    });

    it('should persist add comment and return comment correctly', async () => {
      // Arrange
      const mockComment = {
        owner: 'user-123',
        thread_id: 'thread-123',
        content: 'content',
      };
      await UsersTableTestHelper.addUser({ id: mockComment.owner });
      await ThreadsTableTestHelper.addThread({ id: mockComment.thread_id, owner: mockComment.owner });
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepository.addComment(mockComment);

      // Assert
      const comments = await CommentsTableTestHelper.getCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBe(false);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const mockComment = {
        owner: 'user-123',
        thread_id: 'thread-123',
        content: 'content',
      };
      await UsersTableTestHelper.addUser({ id: mockComment.owner });
      await ThreadsTableTestHelper.addThread({ id: mockComment.thread_id, owner: mockComment.owner });
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepository.addComment(mockComment);

      // Assert
      expect(result).toStrictEqual({
        id: 'comment-123',
        content: 'content',
        owner: 'user-123',
      });
    });
  });

  describe('softDeleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const commentRepository = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepository.softDeleteComment('comment-999', 'thread-123', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not valid', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepository.softDeleteComment('comment-123', 'thread-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when thread is not valid', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepository.softDeleteComment('comment-123', 'thread-456', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should soft delete comment correctly when all conditions are met', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => {});

      // Action
      await commentRepository.softDeleteComment('comment-123', 'thread-123', 'user-123');

      // Assert
      const [comment] = await CommentsTableTestHelper.getCommentById('comment-123');
      expect(comment.is_delete).toBe(true);
    });
  });
});
