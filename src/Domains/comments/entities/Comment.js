class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner, thread_id, is_delete } = payload;
    this.content = content;
    this.owner = owner;
    this.thread_id = thread_id;
    this.is_delete = is_delete;
  }

  _verifyPayload({ content, owner, thread_id, is_delete }) {
    if (content === undefined || owner === undefined || thread_id === undefined || is_delete === undefined) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof thread_id !== 'string' || typeof is_delete !== 'boolean') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (!content.trim() || !owner.trim() || !thread_id.trim()) {
      throw new Error('COMMENT.INVALID_STRING');
    }
  }
}

module.exports = Comment;
