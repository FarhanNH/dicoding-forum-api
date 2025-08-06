const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const PasswordHash = require("../../../Applications/security/PasswordHash");
const BcryptPasswordHash = require("../../../Infrastructures/security/BcryptPasswordHash");
const bcrypt = require("bcrypt");
const container = require("../../container");
const createServer = require("../createServer");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("/comments endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe("/threads/{threadId}/comments endpoint", () => {
    describe("when POST /threads/{threadId}/comments", () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      it("passwordHash must be an instance of PasswordHash", () => {
        expect(passwordHash).toBeInstanceOf(PasswordHash);
      });

      it("should response 201 and persisted comment", async () => {
        // Arrange
        const server = await createServer(container);

        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await ThreadsTableTestHelper.addThread({ id: DUMMY.THREAD_ID, owner: id });

        const requestPayload = {
          content: DUMMY.COMMENT_CONTENT,
        };

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${DUMMY.THREAD_ID}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.addedComment).toBeDefined();
      });

      it("should response 401 when comment with no authentication", async () => {
        // Arrange
        const server = await createServer(container);
        const threadId = DUMMY.THREAD_ID;
        const requestPayload = {
          content: DUMMY.COMMENT_CONTENT,
        };

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual("Missing authentication");
      });

      it("should response 400 when comment with not found thread", async () => {
        // Arrange
        const server = await createServer(container);
        const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        const threadId = DUMMY.THREAD_ID;

        const requestPayload = {
          content: DUMMY.COMMENT_CONTENT,
        };

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
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

      it("should response 400 when comment with bad payload", async () => {
        // Arrange
        const server = await createServer(container);
        const mockThreadId = DUMMY.THREAD_ID;

        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: id });

        const requestPayload = {};

        // Action
        const response = await server.inject({
          method: "POST",
          url: `/threads/${mockThreadId}/comments`,
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
  });

  describe("/threads/{threadId}/comments/{commentId} endpoint ", () => {
    describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      it("passwordHash must be an instance of PasswordHash", () => {
        expect(passwordHash).toBeInstanceOf(PasswordHash);
      });

      it("should response 200 and retun message success", async () => {
        // Arrange
        const server = await createServer(container);
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        const mockUserId = id;
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });
        const comment = await CommentsTableTestHelper.getCommentById(mockCommentId);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: `/threads/${thread[0].id}/comments/${comment[0].id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
      });

      it("should response 401 when delete comment with no authentication", async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = DUMMY.OWNER;
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash("secret");
        await UsersTableTestHelper.addUser({ id: mockUserId, username: DUMMY.USER_USERNAME, password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });
        const comment = await CommentsTableTestHelper.getCommentById(mockCommentId);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: `/threads/${thread[0].id}/comments/${comment[0].id}`,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual("Missing authentication");
      });

      it("should response 400 when delete comment with not found comment", async () => {
        // Arrange
        const server = await createServer(container);
        const mockThreadId = DUMMY.THREAD_ID;
        const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        const mockUserId = id;
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: `/threads/${thread[0].id}/comments/xxx`,
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

      it("should response 403 when delete comment with wrong owner", async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserIdX = DUMMY.OWNER_OTHER;
        const mockThreadId = DUMMY.THREAD_ID;
        const mockCommentId = DUMMY.COMMENT_ID;
        const hashedPassword = await passwordHash.hash("secret");
        await UsersTableTestHelper.addUser({ id: mockUserIdX, username: "dimari", password: hashedPassword });
        const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserIdX });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserIdX, thread_id: mockThreadId });
        const comment = await CommentsTableTestHelper.getCommentById(mockCommentId);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: `/threads/${thread[0].id}/comments/${comment[0].id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("Akses ditolak");
      });
    });
  });
});
