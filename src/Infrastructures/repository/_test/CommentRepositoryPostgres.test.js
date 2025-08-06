const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("CommentRepositoryPostgres", () => {
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

  describe("addComment function", () => {
    it("should throw error when payload not contain needed property", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => "123");
      const invalidPayloads = [
        { thread_id: DUMMY.THREAD_ID, content: DUMMY.REPLY_CONTENT },
        { owner: DUMMY.OWNER, content: DUMMY.REPLY_CONTENT },
        { owner: DUMMY.OWNER, thread_id: DUMMY.THREAD_ID },
      ];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(commentRepository.addComment(payload)).rejects.toThrowError("COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
        })
      );
    });

    it("should throw error when payload not meet data type specification", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => "123");
      const invalidPayloads = [
        { owner: 123, thread_id: DUMMY.THREAD_ID, content: DUMMY.REPLY_CONTENT },
        { owner: DUMMY.OWNER, thread_id: 123, content: DUMMY.REPLY_CONTENT },
        { owner: DUMMY.OWNER, thread_id: DUMMY.THREAD_ID, content: 123 },
      ];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(commentRepository.addComment(payload)).rejects.toThrowError("COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
        })
      );
    });

    it("should persist add comment and return comment correctly", async () => {
      // Arrange
      const mockComment = {
        owner: DUMMY.OWNER,
        thread_id: DUMMY.THREAD_ID,
        content: DUMMY.REPLY_CONTENT,
      };
      await UsersTableTestHelper.addUser({ id: mockComment.owner });
      await ThreadsTableTestHelper.addThread({ id: mockComment.thread_id, owner: mockComment.owner });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepository.addComment(mockComment);

      // Assert
      const comments = await CommentsTableTestHelper.getCommentById(DUMMY.COMMENT_ID);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBe(false);
    });

    it("should return added comment correctly", async () => {
      // Arrange
      const mockComment = {
        owner: DUMMY.OWNER,
        thread_id: DUMMY.THREAD_ID,
        content: DUMMY.REPLY_CONTENT,
      };
      await UsersTableTestHelper.addUser({ id: mockComment.owner });
      await ThreadsTableTestHelper.addThread({ id: mockComment.thread_id, owner: mockComment.owner });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepository.addComment(mockComment);

      // Assert
      expect(result).toStrictEqual({
        id: DUMMY.COMMENT_ID,
        content: DUMMY.REPLY_CONTENT,
        owner: DUMMY.OWNER,
      });
    });
  });

  describe("getCommentById function", () => {
    it("should throw NotFoundError when comment is not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById(DUMMY.COMMENT_ID)).rejects.toThrowError(NotFoundError);
    });

    it("should return content when comment is found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById(DUMMY.COMMENT_ID);

      // Assert
      expect(comment.content).toBe(DUMMY.REPLY_CONTENT);
    });
  });

  describe("getCommentByThreadId function", () => {
    it("should return all comments in detail thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.OWNER, username: DUMMY.USER_USERNAME });
      await ThreadsTableTestHelper.addThread({ id: DUMMY.THREAD_ID, owner: DUMMY.OWNER });
      await CommentsTableTestHelper.addComment({
        id: DUMMY.COMMENT_ID,
        owner: DUMMY.OWNER,
        thread_id: DUMMY.THREAD_ID,
        date: DUMMY.DATE,
        content: DUMMY.COMMENT_CONTENT,
        is_delete: false,
      });

      // Action
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Assert
      const detailComment = await commentRepositoryPostgres.getCommentByThreadId(DUMMY.THREAD_ID);

      expect(detailComment).toEqual([
        {
          id: DUMMY.COMMENT_ID,
          username: DUMMY.USER_USERNAME,
          date: DUMMY.DATE,
          content: DUMMY.COMMENT_CONTENT,
          deleted: false,
        },
      ]);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const payload = {
        comment_id: DUMMY.COMMENT_ID,
        owner: DUMMY.OWNER,
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(payload.comment_id, payload.userId)).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when owner not verified", async () => {
      // Arrange
      const payload = {
        comment_id: DUMMY.COMMENT_ID,
        owner: DUMMY.OWNER_OTHER,
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(payload.comment_id, payload.owner)).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw NotFoundError and Authorization error when payload is correct", async () => {
      // Arrange
      const payload = {
        comment_id: DUMMY.COMMENT_ID,
        owner: DUMMY.OWNER,
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(payload.comment_id, payload.owner)).resolves.not.toThrowError(AuthorizationError, NotFoundError);
    });
  });

  describe("softDeleteComment function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const payload = {
        commentId: DUMMY.COMMENT_ID,
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.softDeleteComment(payload.commentId)).rejects.toThrow(NotFoundError);
    });
    it("should change is_delete in comments table to be true", async () => {
      // Arrange
      const payload = {
        comment_id: DUMMY.COMMENT_ID,
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await commentRepositoryPostgres.softDeleteComment(payload.comment_id);

      // Action & Assert
      const comment = await CommentsTableTestHelper.getCommentById(payload.comment_id);
      expect(comment[0].is_delete).toBe(true);
    });
  });
});
