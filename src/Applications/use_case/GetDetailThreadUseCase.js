class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    const threadReplies = await this._replyRepository.getRepliesByThreadId(threadId);

    detailThread.comments = await this._commentRepository.getCommentByThreadId(threadId);
    detailThread.comments.map((comment) => {
      comment.replies = threadReplies
        .filter((reply) => reply.commentid === comment.id)
        .map((reply) => {
          reply.content = reply.deleted ? "**balasan telah dihapus**" : reply.content;
          return { deleted: reply.deleted, commentid: reply.commentid, ...reply };
        });

      comment.content = comment.deleted ? "**komentar telah dihapus**" : comment.content;
      delete comment.deleted;

      return comment;
    });

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
