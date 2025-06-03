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

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    const passwordHash = new BcryptPasswordHash(bcrypt);
    it('passwordHash must be an instance of PasswordHash', () => {
      expect(passwordHash).toBeInstanceOf(PasswordHash);
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container);
      const mockUser = { id: 'user-123', username: 'dicoding', password: 'secret' };
      const hashedPassword = await passwordHash.hash(mockUser.password);
      await UsersTableTestHelper.addUser({ id: mockUser.id, username: mockUser.username, password: hashedPassword });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password,
        },
      });
      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson.data.accessToken;
      const requestPayload = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when thread with no authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when title more than 50 character', async () => {
      // Arrange
      const server = await createServer(container);
      const mockUser = { id: 'user-123', username: 'dicoding', password: 'secret' };
      const hashedPassword = await passwordHash.hash(mockUser.password);
      await UsersTableTestHelper.addUser({ id: mockUser.id, username: mockUser.username, password: hashedPassword });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password,
        },
      });
      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson.data.accessToken;
      const requestPayload = {
        title: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        body: 'body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena karakter title melebihi batas limit');
    });

    it('should response 400 when thread with bad payload', async () => {
      // Arrange
      const server = await createServer(container);
      const mockUser = { id: 'user-123', username: 'dicoding', password: 'secret' };
      const hashedPassword = await passwordHash.hash(mockUser.password);
      await UsersTableTestHelper.addUser({ id: mockUser.id, username: mockUser.username, password: hashedPassword });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password,
        },
      });
      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson.data.accessToken;
      const requestPayload = {
        title: 123,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan title dan body');
    });

    it('should response 400 when title unavailable', async () => {
      // Arrange
      const server = await createServer(container);
      const mockUser = { id: 'user-123', username: 'dicoding', password: 'secret' };
      const hashedPassword = await passwordHash.hash(mockUser.password);
      await UsersTableTestHelper.addUser({ id: mockUser.id, username: mockUser.username, password: hashedPassword });
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: mockUser.username,
          password: mockUser.password,
        },
      });
      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson.data.accessToken;
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: mockUser.id });
      const requestPayload = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('title tidak tersedia');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    const passwordHash = new BcryptPasswordHash(bcrypt);
    it('passwordHash must be an instance of PasswordHash', () => {
      expect(passwordHash).toBeInstanceOf(PasswordHash);
    });

    it('should response 200 and persisted thread with comment', async () => {
      // Arrange
      const server = await createServer(container);
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const hashedPassword = await passwordHash.hash('secret');
      await UsersTableTestHelper.addUser({ id: mockUserId, username: 'dicoding', password: hashedPassword });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId, owner: mockUserId, thread_id: mockThreadId });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${mockThreadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
