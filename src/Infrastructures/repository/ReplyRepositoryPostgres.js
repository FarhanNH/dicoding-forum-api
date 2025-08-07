const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const Reply = require("../../Domains/replies/entities/Reply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(payload) {
    const { content, date = new Date().toISOString(), owner, thread_id, comment_id } = payload;
    const id = `reply-${this._idGenerator()}`;
    const reply = new Reply({ content, date, owner, thread_id, comment_id });

    const query = {
      text: "INSERT INTO replies(id, content, date, owner, thread_id, comment_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, reply.content, reply.date, reply.owner, reply.thread_id, reply.comment_id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getReplyById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("reply tidak ditemukan");
    }
    return result.rows[0];
  }

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

    const verified = result.rows[0].owner === owner;
    if (!verified) {
      throw new AuthorizationError("Akses ditolak");
    }
  }

  async deleteReplyById(id) {
    const query = {
      text: "UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("reply tidak ditemukan");
    }
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, users.username, 
             replies.comment_id as commentid, replies.is_delete as deleted
             FROM replies
             JOIN users ON replies.owner = users.id
             WHERE replies.thread_id = $1
             ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
