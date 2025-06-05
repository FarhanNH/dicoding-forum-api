class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(id, owner, threadId, commentId) {
    this._verifyPayload(id, owner, threadId, commentId);
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentById(commentId);
    await this._replyRepository.verifyReplyOwner({ id, owner });
    await this._replyRepository.deleteReplyById(id);
  }

  _verifyPayload(id, owner, threadId, commentId) {
    if (!id || !owner || !threadId || !commentId) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
