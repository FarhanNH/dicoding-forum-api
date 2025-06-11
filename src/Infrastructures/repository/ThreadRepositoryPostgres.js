const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const { title, body, date = new Date().toISOString(), owner } = thread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1,$2,$3,$4,$5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.date, u.username
      FROM threads t
      JOIN users u
      ON t.owner = u.id
      WHERE t.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('THREAD.THREAD_NOT_FOUND');
    }

    return result.rows[0];
  }

  async getDetailThreadById(id) {
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
  }
}

module.exports = ThreadRepositoryPostgres;
