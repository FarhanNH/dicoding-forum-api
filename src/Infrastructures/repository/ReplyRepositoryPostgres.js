const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(payload) {
    const { content, date = new Date().toISOString(), owner, thread_id, comment_id } = payload;
    const id = `reply-${this._idGenerator()}`;

    this._verifyReplyPayload({ content, owner, thread_id, comment_id });

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, thread_id, comment_id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getReplyById(id) {
    const query = {
      text: 'SELECT content FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
    return result.rows[0];
  }

  async verifyReplyOwner(payload) {
    const { id, owner } = payload;

    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    const verified = result.rows[0].owner == owner;
    if (!verified) {
      throw new AuthorizationError('Akses ditolak');
    }
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

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
  }

  _verifyReplyPayload({ content, owner, thread_id, comment_id }) {
    if (!content || !owner || !thread_id || !comment_id) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof thread_id !== 'string' || typeof comment_id !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
