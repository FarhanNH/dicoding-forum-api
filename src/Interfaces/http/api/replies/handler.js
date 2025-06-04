class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const payload = {
      ...request.payload,
      owner: credentialId,
      thread_id: threadId,
      comment_id: commentId,
    };
    const addReplyUseCase = this._container.getInsta;
  }
}

module.exports = RepliesHandler;
