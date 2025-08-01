/* istanbul ignore file */
const { DUMMY } = require("../src/Commons/utils/Constants");
const pool = require("../src/Infrastructures/database/postgres/pool");

const AuthenticationsTableTestHelper = {
  async addToken(token) {
    const query = {
      text: "INSERT INTO authentications VALUES($1)",
      values: [token],
    };

    await pool.query(query);
  },

  async findToken(token) {
    const query = {
      text: "SELECT token FROM authentications WHERE token = $1",
      values: [token],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async getAccessToken({ server, username = DUMMY.USER_USERNAME }) {
    const payload = {
      username,
      password: DUMMY.USER_PASSWORD,
    };

    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        ...payload,
        fullname: DUMMY.USER_FULLNAME,
      },
    });

    const responseAuthentication = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        ...payload,
      },
    });

    const { id } = JSON.parse(response.payload).data.addedUser;
    const { accessToken } = JSON.parse(responseAuthentication.payload).data;

    return {
      id,
      accessToken,
    };
  },

  async cleanTable() {
    await pool.query("DELETE FROM authentications WHERE 1=1");
  },
};

module.exports = AuthenticationsTableTestHelper;
