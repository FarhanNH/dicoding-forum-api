const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { owner, thread_id, date = new Date().toISOString(), content } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, thread_id, date, content],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }
}

module.exports = CommentRepositoryPostgres;
