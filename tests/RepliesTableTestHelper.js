/* istanbul ignore file */
const AuthorizationError = require("../src/Commons/exceptions/AuthorizationError");
const NotFoundError = require("../src/Commons/exceptions/NotFoundError");
const { DUMMY } = require("../src/Commons/utils/Constants");
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({ id = DUMMY.REPLY_ID, content = DUMMY.REPLY_CONTENT, date = DUMMY.DATE, owner = DUMMY.OWNER, thread_id = DUMMY.THREAD_ID, comment_id = DUMMY.COMMENT_ID }) {
    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, date, owner, thread_id, comment_id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async getReplyById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async verifyReplyOwner(payload) {
    const { id, owner } = payload;
    const query = {
      text: "SELECT owner FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("reply tidak ditemukan");
    }

    const verified = (result.rows[0].owner = owner);
    if (!verified) {
      throw new AuthorizationError("Akses ditolak");
    }
  },

  async deleteReplyById(id) {
    const query = {
      text: "UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("reply tidak ditemukan");
    }
  },

  async getRepliesFromComment(id) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, users.username,
      CASE
        WHEN replies.is_delete = TRUE THEN '**balasan telah dihapus**'
        ELSE replies.content
      END
      FROM replies
      JOIN users
      ON replies.owner = users.id
      JOIN comments
      ON replies.comment_id = comments.id
      WHERE comments.id = $1
      ORDER BY replies.date ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies WHERE 1=1");
  },
};

module.exports = RepliesTableTestHelper;
