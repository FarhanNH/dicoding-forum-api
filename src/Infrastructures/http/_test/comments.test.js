const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const PasswordHash = require('../../../Applications/security/PasswordHash');
const BcryptPasswordHash = require('../../../Infrastructures/security/BcryptPasswordHash');
const bcrypt = require('bcrypt');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('/threads/{threadId}/comments endpoint', () => {
    describe('when POST /threads/{threadId}/comments', () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      it('passwordHash must be an instance of PasswordHash', () => {
        expect(passwordHash).toBeInstanceOf(PasswordHash);
      });

      it('should response 201 and persisted comment', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const mockThreadId = 'thread-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });

        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });

        const loginResponseJson = JSON.parse(loginResponse.payload);
        const accessToken = loginResponseJson.data.accessToken;

        const requestPayload = {
          content: 'Ini komentar',
        };

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${mockThreadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedComment).toBeDefined();
      });

      it('should response 401 when comment with no authentication', async () => {
        // Arrange
        const server = await createServer(container);
        const threadId = 'thread-123';
        const requestPayload = {
          content: 'Ini komentar',
        };

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 400 when comment with not found thread', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });

        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });

        const loginResponseJson = JSON.parse(loginResponse.payload);
        const accessToken = loginResponseJson.data.accessToken;
        const threadId = 'thread-123';

        const requestPayload = {
          content: 'Ini komentar',
        };

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 400 when comment with bad payload', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const mockThreadId = 'thread-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });

        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });

        const loginResponseJson = JSON.parse(loginResponse.payload);
        const accessToken = loginResponseJson.data.accessToken;

        const requestPayload = {};

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${mockThreadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('harus mengirimkan content');
      });
    });
  });

  describe('/threads/{threadId}/comments/{commentId} endpoint ', () => {
    describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      it('passwordHash must be an instance of PasswordHash', () => {
        expect(passwordHash).toBeInstanceOf(PasswordHash);
      });

      it('should response 200 and retun message success', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const mockThreadId = 'thread-123';
        const mockCommentId = 'comment-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
        const user = await UsersTableTestHelper.getUserById(mockUserId);
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });
        const comment = await CommentsTableTestHelper.getCommentById(mockCommentId);

        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: user[0].username,
            password: 'secret',
          },
        });

        const loginResponseJson = JSON.parse(loginResponse.payload);
        const accessToken = loginResponseJson.data.accessToken;

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${thread[0].id}/comments/${comment[0].id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });

      it('should response 401 when delete comment with no authentication', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const mockThreadId = 'thread-123';
        const mockCommentId = 'comment-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });
        const comment = await CommentsTableTestHelper.getCommentById(mockCommentId);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${thread[0].id}/comments/${comment[0].id}`,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 400 when delete comment with not found comment', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const mockThreadId = 'thread-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
        const user = await UsersTableTestHelper.getUserById(mockUserId);
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);

        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: user[0].username,
            password: 'secret',
          },
        });

        const loginResponseJson = JSON.parse(loginResponse.payload);
        const accessToken = loginResponseJson.data.accessToken;

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${thread[0].id}/comments/xxx`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('comment tidak tersedia');
      });

      it('should response 403 when delete comment with wrong owner', async () => {
        // Arrange
        const server = await createServer(container);
        const mockUserId = 'user-123';
        const mockUserIdX = 'user-999';
        const mockThreadId = 'thread-123';
        const mockCommentId = 'comment-123';
        const hashedPassword = await passwordHash.hash('secret');
        await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
        await UsersTableTestHelper.addUser({ id: mockUserIdX, username: 'dimari', password: hashedPassword });
        const user = await UsersTableTestHelper.getUserById(mockUserIdX);
        await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
        const thread = await ThreadsTableTestHelper.getThreadById(mockThreadId);
        await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });
        const comment = await CommentsTableTestHelper.getCommentById(mockCommentId);

        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: user[0].username,
            password: 'secret',
          },
        });

        const loginResponseJson = JSON.parse(loginResponse.payload);
        const accessToken = loginResponseJson.data.accessToken;

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${thread[0].id}/comments/${comment[0].id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('Akses ditolak');
      });
    });
  });
});
