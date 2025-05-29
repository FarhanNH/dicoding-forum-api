const pool = require('../../database/postgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const server = await createServer(container);
      const mockUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: mockUser,
      });

      const userResponseJson = JSON.parse(userResponse.payload);
      const user = userResponseJson.data.addedUser;

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: user.username,
          password: mockUser.password,
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson.data.accessToken;

      const mockThread = {
        title: 'First Thread',
        body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: mockThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });
  });
});
