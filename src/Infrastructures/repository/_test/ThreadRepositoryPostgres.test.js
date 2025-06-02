const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyAvailableTitle function', () => {
    it('should throw InvariantError when title not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ title: 'First Thread' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableTitle('First Thread')).rejects.toThrowError(InvariantError);
    });
  });

  describe('addThread function', () => {
    it('should persist add thread and return thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const mockThread = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
        date: new Date().toISOString(),
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(mockThread);

      // Assert
      const addedThread = await ThreadsTableTestHelper.getThreadById('thread-123');
      expect(addedThread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const date = new Date().toISOString();
      const mockThread = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
        date: date,
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await threadRepositoryPostgres.addThread(mockThread);

      // Assert
      expect(result).toStrictEqual({
        id: 'thread-123',
        title: 'First Thread',
        owner: 'user-123',
      });
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      await expect(threadRepositoryPostgres.getThreadById('thread-1')).rejects.toThrowError(NotFoundError);
    });

    it('should persist get thread by id and return thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const result = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(result.id).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.body).toBeDefined();
      expect(result.date).toBeDefined();
      expect(result.username).toBeDefined();
    });
  });

  describe('getDetailThreadById', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      expect(threadRepositoryPostgres.getDetailThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread correctly', async () => {
      // Arrange
      const payload = {
        thread_id: 'thread-123',
      };
      const mockComments = {
        id: 'comment-123',
        username: 'dicoding',
        content: 'content',
      };
      const mockDetailThread = {
        id: 'thread-123',
        title: 'First Thread',
        body: 'Lorem ipsum blablablabla',
        username: 'dicoding',
        comments: [mockComments],
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const detailThread = await threadRepositoryPostgres.getDetailThreadById(payload.thread_id);

      // Assert
      expect(detailThread.id).toBe(mockDetailThread.id);
      expect(detailThread.title).toBe(mockDetailThread.title);
      expect(detailThread.body).toBe(mockDetailThread.body);
      expect(detailThread.date).toEqual(new Date(detailThread.date).toISOString());
      expect(detailThread.username).toBe(mockDetailThread.username);
      expect(detailThread.comments[0].id).toBe(mockComments.id);
      expect(detailThread.comments[0].username).toBe(mockComments.username);
      expect(detailThread.comments[0].date).toEqual(new Date(detailThread.comments[0].date).toISOString());
      expect(detailThread.comments[0].content).toBe(mockComments.content);
    });
  });
});
