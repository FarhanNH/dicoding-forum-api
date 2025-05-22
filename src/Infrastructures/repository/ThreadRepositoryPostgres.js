const InvariantError = require('../../Commons/exceptions/InvariantError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyAvailableTitle(title) {
    const query = {
      text: 'SELECT title FROM threads WHERE title = $1',
      values: [title],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new InvariantError('THREAD_REPOSITORY.TITLE_ALREADY_EXISTS');
    }
  }

  async addThread(thread) {
    const { title, body, date, owner } = thread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1,$2,$3,$4,$5) RETURNING id, title, body, date, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }
}

module.exports = ThreadRepositoryPostgres;
