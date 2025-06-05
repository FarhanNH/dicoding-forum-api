const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { owner, thread_id, date = new Date().toISOString(), content } = comment;
    const id = `comment-${this._idGenerator()}`;

    this._verifyCommentPayload({ owner, thread_id, content });

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, thread_id, date, content],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getCommentById(id) {
    const query = {
      text: 'SELECT content FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak tersedia');
    }
    return result.rows[0];
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak tersedia');
    }

    const verified = result.rows[0].owner === owner;
    if (!verified) {
      throw new AuthorizationError('Akses ditolak');
    }
  }

  async softDeleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak tersedia');
    }
  }

  _verifyCommentPayload({ owner, thread_id, content }) {
    if (!owner || !thread_id || !content) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof thread_id !== 'string' || typeof content !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentRepositoryPostgres;
