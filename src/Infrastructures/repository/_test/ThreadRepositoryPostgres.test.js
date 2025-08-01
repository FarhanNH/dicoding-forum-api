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

  describe("getDetailThreadById", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      expect(threadRepositoryPostgres.getDetailThreadById(DUMMY.THREAD_ID)).rejects.toThrowError(NotFoundError);
    });

    it("should return detail thread correctly", async () => {
      // Arrange
      const payload = {
        thread_id: DUMMY.THREAD_ID,
      };
      const mockComments = {
        id: DUMMY.COMMENT_ID,
        username: DUMMY.USER_USERNAME,
        content: DUMMY.COMMENT_CONTENT,
      };
      const mockDetailThread = {
        id: DUMMY.THREAD_ID,
        title: DUMMY.THREAD_TITLE,
        body: DUMMY.THREAD_BODY,
        username: DUMMY.USER_USERNAME,
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
