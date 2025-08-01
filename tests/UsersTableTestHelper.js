/* istanbul ignore file */
const { DUMMY } = require("../src/Commons/utils/Constants");
const pool = require("../src/Infrastructures/database/postgres/pool");

const UsersTableTestHelper = {
  async addUser({ id = DUMMY.USER_ID, username = DUMMY.USER_USERNAME, password = DUMMY.USER_PASSWORD, fullname = DUMMY.USER_FULLNAME }) {
    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4)",
      values: [id, username, password, fullname],
    };

    await pool.query(query);
  },

  async getUserById(id) {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM users WHERE 1=1");
  },
};

module.exports = UsersTableTestHelper;
