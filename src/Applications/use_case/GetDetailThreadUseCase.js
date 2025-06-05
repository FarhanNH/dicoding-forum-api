class GetDetailThreadUseCase {
  constructor({ threadRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    let detailThread = await this._threadRepository.getDetailThreadById(threadId);

    for (let i = 0; i < detailThread.comments.length; i++) {
      const comment = detailThread.comments[i];
      const replies = await this._replyRepository.getRepliesFromComment(comment.id);
      detailThread.comments[i].replies = replies;
    }

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
