const pool = require("../../database/postgres/pool");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
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

describe("/threads endpoint", () => {
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

  describe("when POST /threads", () => {
    const passwordHash = new BcryptPasswordHash(bcrypt);
    it("passwordHash must be an instance of PasswordHash", () => {
      expect(passwordHash).toBeInstanceOf(PasswordHash);
    });

    it("should response 201 and persisted thread", async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      const requestPayload = {
        title: DUMMY.THREAD_TITLE,
        body: DUMMY.THREAD_BODY,
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it("should response 401 when thread with no authentication", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: DUMMY.THREAD_TITLE,
        body: DUMMY.THREAD_BODY,
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual("Missing authentication");
    });

    it("should response 400 when title more than 50 character", async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      const requestPayload = {
        title: "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
        body: "body",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("tidak dapat membuat thread baru karena karakter title melebihi batas limit");
    });

    it("should response 400 when thread with bad payload", async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      const requestPayload = {
        title: 123,
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("harus mengirimkan title dan body");
    });
  });

  describe("when GET /threads/{threadId}", () => {
    const passwordHash = new BcryptPasswordHash(bcrypt);
    it("passwordHash must be an instance of PasswordHash", () => {
      expect(passwordHash).toBeInstanceOf(PasswordHash);
    });

    it("should response 200 and persisted thread with comment", async () => {
      // Arrange
      const server = await createServer(container);
      const mockUserId = DUMMY.USER_ID;
      const mockThreadId = "thread-123";
      const mockCommentId = "comment-123";
      const mockReplyId = "reply-123";
      const hashedPassword = await passwordHash.hash(DUMMY.USER_PASSWORD);
      await UsersTableTestHelper.addUser({ id: mockUserId, username: DUMMY.USER_USERNAME, password: hashedPassword });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });
      await RepliesTableTestHelper.addReply({ id: mockReplyId, owner: mockUserId, thread_id: mockThreadId, comment_id: mockCommentId });

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${mockThreadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
