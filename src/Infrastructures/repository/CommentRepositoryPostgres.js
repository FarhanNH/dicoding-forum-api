const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { owner, thread_id, date = new Date().toISOString(), content, is_delete = false } = comment;
    const id = `comment-${this._idGenerator()}`;

    this._verifyCommentPayload({ owner, thread_id, content });

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, owner, thread_id, date, content, is_delete],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async softDeleteComment(commentId, threadId, owner) {
    const verifyQuery = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2 AND owner = $3',
      values: [commentId, threadId, owner],
    };

    const verifyResult = await this._pool.query(verifyQuery);

    if (!verifyResult.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan atau tidak memiliki akses');
    }

    const deleteQuery = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(deleteQuery);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus komentar');
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
