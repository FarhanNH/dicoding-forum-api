const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
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
      const mockUser = {
        id: 'user-123',
        username: 'dicoding',
      };
      await UsersTableTestHelper.addUser(mockUser);
      await ThreadsTableTestHelper.addThread({ title: 'First Thread' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableTitle('First Thread')).rejects.toThrowError(InvariantError);
    });
  });

  describe('addThread function', () => {
    it('should persist add thread and return thread correctly', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        username: 'dicoding',
      };
      await UsersTableTestHelper.addUser(mockUser);
      const mockThread = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
        date: new Date().toISOString(),
        owner: mockUser.id,
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
      const mockUser = {
        id: 'user-123',
        username: 'dicoding',
      };
      await UsersTableTestHelper.addUser(mockUser);
      const date = new Date().toISOString();
      const mockThread = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
        date: date,
        owner: mockUser.id,
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
});
