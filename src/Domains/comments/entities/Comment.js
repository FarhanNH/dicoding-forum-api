class Comment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content, owner, thread_id } = payload;
    this.content = content;
    this.owner = owner;
    this.thread_id = thread_id;
  }

  _verifyPayload({ content, owner, thread_id }) {
    if (!content || !owner || !thread_id) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string' || typeof owner !== 'string' || typeof thread_id !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
