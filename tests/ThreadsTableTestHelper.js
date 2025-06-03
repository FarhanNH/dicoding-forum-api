/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({ id = 'thread-123', title = 'First Thread', body = 'Lorem ipsum blablablabla', date = new Date().toISOString(), owner = 'user-123' }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
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

  async getThreadCommentById(id) {
    const thread = await this.getThreadById(id);
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content,
      CASE 
          WHEN comments.is_delete = TRUE THEN '**komentar telah dihapus**'
          ELSE comments.content
      END
      FROM comments
      JOIN users
      ON comments.owner = users.id
      JOIN threads
      ON comments.thread_id = threads.id
      WHERE threads.id = $1
      ORDER BY comments.date ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);
    const comments = result.rows;
    const detailThread = {
      ...thread,
      comments,
    };
    return detailThread;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
