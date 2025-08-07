class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    const detailThread = await this._threadRepository.getThreadById(threadId);
    const threadReplies = await this._replyRepository.getRepliesByThreadId(threadId);

    detailThread.comments = await this._commentRepository.getCommentByThreadId(threadId);
    detailThread.comments = detailThread.comments.map((comment) => {
      const replies = threadReplies
        .filter((reply) => reply.commentid === comment.id)
        .map(({ commentid, deleted, content, ...reply }) => ({
          ...reply,
          content: deleted ? "**balasan telah dihapus**" : content,
        }));

      comment.content = comment.deleted ? "**komentar telah dihapus**" : comment.content;
      delete comment.deleted;

      return {
        ...comment,
        replies,
      };
    });

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
