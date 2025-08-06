const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const PasswordHash = require("../../../Applications/security/PasswordHash");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const BcryptPasswordHash = require("../../security/BcryptPasswordHash");
const createServer = require("../createServer");
const bcrypt = require("bcrypt");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("/comments endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe("/threads/{threadId}/comments/{commentId}/replies endpoint", () => {
    const passwordHash = new BcryptPasswordHash(bcrypt);
    it("passwordHash must be an instance of PasswordHash", () => {
      expect(passwordHash).toBeInstanceOf(PasswordHash);
    });

    describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
      it("should response 201 and persisted reply", async () => {
        // Arrange
        const server = await createServer(container);
        const mockUser = {
          id: DUMMY.OWNER,
          username: DUMMY.USER_USERNAME,
          password: DUMMY.USER_PASSWORD,
        };
        const mockUserX = {
          id: DUMMY.OWNER_OTHER,
          username: "dimari",
          password: DUMMY.USER_PASSWORD,
        };
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash(mockUser.password);
        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await UsersTableTestHelper.addUser({ id: mockUserX.id, username: mockUserX.username, password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: id });
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: id, thread_id: mockThreadId });

        const requestPayload = { content: DUMMY.REPLY_CONTENT };

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.addedReply).toBeDefined();
      });

      it("should response 401 when reply with no authentication", async () => {
        // Arrange
        const server = await createServer(container);
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const requestPayload = {
          content: DUMMY.REPLY_CONTENT,
        };

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual("Missing authentication");
      });

      it("should response 404 when reply with not found thread", async () => {
        // Arrange
        const server = await createServer(container);
        const mockUser = {
          id: DUMMY.OWNER,
          username: DUMMY.USER_USERNAME,
          password: DUMMY.USER_PASSWORD,
        };
        const mockUserX = {
          id: DUMMY.OWNER_OTHER,
          username: "dimari",
          password: DUMMY.USER_PASSWORD,
        };
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash(mockUser.password);
        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await UsersTableTestHelper.addUser({ id: mockUserX.id, username: mockUserX.username, password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: id });
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: id, thread_id: mockThreadId });

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${"thread-999"}/comments/${mockCommentId}/replies`,
          payload: { content: DUMMY.REPLY_CONTENT },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("thread tidak tersedia");
      });

      it("should response 404 when reply with not found comment", async () => {
        // Arrange
        const server = await createServer(container);
        const mockUser = {
          id: DUMMY.OWNER,
          username: DUMMY.USER_USERNAME,
          password: DUMMY.USER_PASSWORD,
        };
        const mockUserX = {
          id: DUMMY.OWNER_OTHER,
          username: "dimari",
          password: DUMMY.USER_PASSWORD,
        };
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash(mockUser.password);
        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await UsersTableTestHelper.addUser({ id: mockUserX.id, username: mockUserX.username, password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: id });
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: id, thread_id: mockThreadId });

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${mockThreadId}/comments/${"comment-999"}/replies`,
          payload: { content: DUMMY.REPLY_CONTENT },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("comment tidak tersedia");
      });

      it("should response 400 when reply with bad payload", async () => {
        // Arrange
        const server = await createServer(container);
        const mockUser = {
          id: DUMMY.OWNER,
          username: DUMMY.USER_USERNAME,
          password: DUMMY.USER_PASSWORD,
        };
        const mockUserX = {
          id: DUMMY.OWNER_OTHER,
          username: "dimari",
          password: DUMMY.USER_PASSWORD,
        };
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash(mockUser.password);
        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await UsersTableTestHelper.addUser({ id: mockUserX.id, username: mockUserX.username, password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: id });
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: id, thread_id: mockThreadId });

        const requestPayload = {};

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("harus mengirimkan content");
      });
    });

    describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
      it("should response 200 and persisted reply", async () => {
        // Arrange
        const server = await createServer(container);

        const mockUser = {
          id: DUMMY.OWNER,
          username: DUMMY.USER_USERNAME,
          password: DUMMY.USER_PASSWORD,
        };
        const mockUserX = {
          id: DUMMY.OWNER_OTHER,
          username: "dimari",
          password: DUMMY.USER_PASSWORD,
        };
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash(mockUser.password);
        const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await UsersTableTestHelper.addUser({ id: mockUserX.id, username: mockUserX.username, password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserX.id });
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserX.id, thread_id: mockThreadId });

        const requestPayload = { content: DUMMY.REPLY_CONTENT };

        const addReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const addReplyResponseJson = JSON.parse(addReplyResponse.payload);
        const replyId = addReplyResponseJson.data.addedReply.id;

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
      });
    });
  });
});
