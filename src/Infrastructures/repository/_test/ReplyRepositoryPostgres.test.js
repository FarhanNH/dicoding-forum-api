const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("ReplyRepositoryPostgres", () => {
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should throw error when payload not contain needed property", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");
      const invalidPayloads = [{ thread_id: DUMMY.THREAD_ID, content: DUMMY.REPLY_CONTENT }, { comment_id: DUMMY.COMMENT_ID, content: DUMMY.REPLY_CONTENT }, { owner: DUMMY.OWNER, content: DUMMY.REPLY_CONTENT }, { content: DUMMY.REPLY_CONTENT, owner: DUMMY.OWNER, thread_id: DUMMY.THREAD_ID }, {}];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(replyRepository.addReply(payload)).rejects.toThrowError("REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
        })
      );
    });

    it("should throw error when payload not meet data type specification", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");
      const invalidPayloads = [
        { content: DUMMY.REPLY_CONTENT, owner: 123, thread_id: DUMMY.THREAD_ID, comment_id: DUMMY.COMMENT_ID },
        { content: DUMMY.REPLY_CONTENT, owner: DUMMY.OWNER, thread_id: 123, comment_id: DUMMY.COMMENT_ID },
        { content: 123, owner: DUMMY.OWNER, thread_id: DUMMY.THREAD_ID, comment_id: DUMMY.COMMENT_ID },
      ];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(replyRepository.addReply(payload)).rejects.toThrowError("REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
        })
      );
    });

    it("should persist add reply and return reply correctly", async () => {
      // Arrange
      const mockReply = {
        content: DUMMY.REPLY_CONTENT,
        owner: DUMMY.OWNER,
        thread_id: DUMMY.THREAD_ID,
        comment_id: DUMMY.COMMENT_ID,
      };
      await UsersTableTestHelper.addUser({ id: mockReply.owner });
      await ThreadsTableTestHelper.addThread({ id: mockReply.thread_id, owner: mockReply.owner });
      await CommentsTableTestHelper.addComment({ id: mockReply.comment_id, owner: mockReply.owner });
      const fakeIdGenerator = () => "123";
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepository.addReply(mockReply);

      // Assert
      const reply = await RepliesTableTestHelper.getReplyById(DUMMY.REPLY_ID);
      expect(reply).toHaveLength(1);
      expect(reply[0].is_delete).toBe(false);
    });

    it("should return added reply correctly", async () => {
      // Arrange
      const mockReply = {
        content: DUMMY.REPLY_CONTENT,
        owner: DUMMY.OWNER,
        thread_id: DUMMY.THREAD_ID,
        comment_id: DUMMY.COMMENT_ID,
      };
      await UsersTableTestHelper.addUser({ id: mockReply.owner });
      await ThreadsTableTestHelper.addThread({ id: mockReply.thread_id, owner: mockReply.owner });
      await CommentsTableTestHelper.addComment({ id: mockReply.comment_id, owner: mockReply.owner });
      const fakeIdGenerator = () => "123";
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await replyRepository.addReply(mockReply);

      // Assert
      expect(result).toStrictEqual({
        id: DUMMY.REPLY_ID,
        content: DUMMY.REPLY_CONTENT,
        owner: DUMMY.OWNER,
      });
    });
  });

  describe("getReplyById function", () => {
    it("should throw NotFoundError when reply is not found", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.getReplyById(DUMMY.REPLY_ID)).rejects.toThrowError(NotFoundError);
    });

    it("should return content when reply is found", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      // Action
      const reply = await replyRepository.getReplyById(DUMMY.REPLY_ID);

      // Assert
      expect(reply.content).toBe(DUMMY.REPLY_CONTENT);
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const payload = {
        id: DUMMY.REPLY_ID,
        owner: DUMMY.OWNER,
      };
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(payload)).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when owner not verified", async () => {
      // Arrange
      const payload = {
        id: DUMMY.REPLY_ID,
        owner: DUMMY.OWNER_OTHER,
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(payload)).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw NotFoundError and Authorization error when payload is correct", async () => {
      // Arrange
      const payload = {
        id: DUMMY.REPLY_ID,
        owner: DUMMY.OWNER,
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(payload)).resolves.not.toThrowError(AuthorizationError, NotFoundError);
    });
  });

  describe("deleteReplyBydId function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const payload = {
        id: DUMMY.REPLY_ID,
      };

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.deleteReplyById(payload)).rejects.toThrowError(NotFoundError);
    });

    it("should change is_delete in replies table to be true", async () => {
      // Arrange
      const payload = {
        id: DUMMY.REPLY_ID,
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await replyRepository.deleteReplyById(payload.id);

      // Action & Assert
      const reply = await RepliesTableTestHelper.getReplyById(payload.id);
      expect(reply[0].is_delete).toBe(true);
    });
  });

  describe("getRepliesByThreadId function", () => {
    it("should return detail thread correctly", async () => {
      // Arrange
      const payload = {
        thread_id: DUMMY.THREAD_ID,
      };

      const mockReply = {
        id: DUMMY.REPLY_ID,
        content: DUMMY.REPLY_CONTENT,
        date: DUMMY.DATE,
        username: DUMMY.USER_USERNAME,
        commentid: DUMMY.COMMENT_ID,
        deleted: false,
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ id: mockReply.id, content: mockReply.content, date: mockReply.date });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const reply = await replyRepositoryPostgres.getRepliesByThreadId(payload.thread_id);

      // Assert
      expect(reply[0].id).toBe(mockReply.id);
      expect(reply[0].content).toBe(mockReply.content);
      expect(reply[0].date).toEqual(mockReply.date);
      expect(reply[0].username).toBe(mockReply.username);
      expect(reply[0].commentid).toBe(mockReply.commentid);
      expect(reply[0].deleted).toBe(mockReply.deleted);
    });
  });

  describe("getRepliesFromComment function", () => {
    it("should return detail thread correctly", async () => {
      // Arrange
      const payload = {
        comment_id: DUMMY.COMMENT_ID,
      };

      const mockReply = {
        id: DUMMY.REPLY_ID,
        content: DUMMY.REPLY_CONTENT,
        date: DUMMY.DATE,
        username: DUMMY.USER_USERNAME,
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ id: mockReply.id, content: mockReply.content, date: mockReply.date });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const reply = await replyRepositoryPostgres.getRepliesFromComment(payload.comment_id);

      // Assert
      expect(reply[0].id).toBe(mockReply.id);
      expect(reply[0].content).toBe(mockReply.content);
      expect(reply[0].date).toEqual(mockReply.date);
      expect(reply[0].username).toBe(mockReply.username);
    });
  });
});
