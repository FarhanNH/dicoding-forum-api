class GetThreadCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    let threadComment = await this._threadRepository.getThreadCommentById(threadId);
    return threadComment;
  }
}

module.exports = GetThreadCommentUseCase;
