const CommentRepository = require("../../Domains/comments/CommentRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const Comment = require("../../Domains/comments/entities/Comment");
class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { owner, thread_id, date = new Date().toISOString(), content } = comment;
    const id = `comment-${this._idGenerator()}`;
    new Comment({ content, thread_id, owner });
    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, owner, thread_id, date, content],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getCommentById(id) {
    const query = {
      text: "SELECT content FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("comment tidak tersedia");
    }
    return result.rows[0];
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, users.username, comments.is_delete as deleted
      FROM comments
      INNER JOIN users
      ON comments.owner = users.id
      WHERE comments.thread_id = $1
      ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("comment tidak tersedia");
    }

    const verified = result.rows[0].owner === owner;
    if (!verified) {
      throw new AuthorizationError("Akses ditolak");
    }
  }

  async softDeleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("comment tidak tersedia");
    }
  }
}

module.exports = CommentRepositoryPostgres;
