const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("ThreadRepositoryPostgres", () => {
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

  describe("addThread function", () => {
    it("should persist add thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.OWNER });
      const mockThread = {
        title: DUMMY.THREAD_TITLE,
        body: DUMMY.THREAD_BODY,
        date: DUMMY.THREAD_DATE,
        owner: DUMMY.OWNER,
      };
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(mockThread);

      // Assert
      const addedThread = await ThreadsTableTestHelper.getThreadById(DUMMY.THREAD_ID);
      expect(addedThread).toHaveLength(1);
    });

    it("should return added thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.OWNER });
      const mockThread = {
        title: DUMMY.THREAD_TITLE,
        body: DUMMY.THREAD_BODY,
        date: DUMMY.THREAD_DATE,
        owner: DUMMY.OWNER,
      };

      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await threadRepositoryPostgres.addThread(mockThread);

      // Assert
      expect(result).toStrictEqual({
        id: DUMMY.THREAD_ID,
        title: DUMMY.THREAD_TITLE,
        owner: DUMMY.OWNER,
      });
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError when thread not available", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.OWNER });
      await ThreadsTableTestHelper.addThread({ id: DUMMY.THREAD_ID });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      await expect(threadRepositoryPostgres.getThreadById("thread-1")).rejects.toThrowError(NotFoundError);
    });

    it("should persist get thread by id and return thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.OWNER });
      await ThreadsTableTestHelper.addThread({ id: DUMMY.THREAD_ID });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const result = await threadRepositoryPostgres.getThreadById(DUMMY.THREAD_ID);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.body).toBeDefined();
      expect(result.date).toBeDefined();
      expect(result.username).toBeDefined();
    });
  });
});
