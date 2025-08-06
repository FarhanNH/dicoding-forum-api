/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");
const { DUMMY } = require("../src/Commons/utils/Constants");

const ThreadsTableTestHelper = {
  async addThread({ id = DUMMY.THREAD_ID, title = DUMMY.THREAD_TITLE, body = DUMMY.THREAD_BODY, date = DUMMY.THREAD_DATE, owner = DUMMY.OWNER }) {
    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5)",
      values: [id, title, body, date, owner],
    };

    await pool.query(query);
  },

  async getThreadById(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.date, u.username
      FROM threads t
      JOIN users u
      ON t.owner = u.id
      WHERE t.id = $1`,
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM threads WHERE 1=1");
  },
};

module.exports = ThreadsTableTestHelper;
