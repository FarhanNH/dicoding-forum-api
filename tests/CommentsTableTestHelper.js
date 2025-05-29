/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', owner = 'user-123', thread_id = 'thread-123', date = new Date().toISOString(), content = 'content' }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
      values: [id, owner, thread_id, date, content],
    };

    await pool.query(query);
  },

  async getCommentById(id) {
    const query = {
      text: ' SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getCommentsByThreadId(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
