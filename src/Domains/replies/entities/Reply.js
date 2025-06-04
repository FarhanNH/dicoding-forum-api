class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner, thread_id, comment_id } = payload;
    this.content = content;
    this.owner = owner;
    this.thread_id = thread_id;
    this.comment_id = comment_id;
  }

  _verifyPayload({ content, owner, thread_id, comment_id }) {
    if (!content || !owner || !thread_id || !comment_id) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof thread_id !== 'string' || typeof comment_id !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
