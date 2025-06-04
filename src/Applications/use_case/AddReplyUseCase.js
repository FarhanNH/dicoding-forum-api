const Reply = require('../../Domains/replies/entities/Reply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository, userRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    try {
      await this._userRepository.getUserById(useCasePayload.owner);
      await this._threadRepository.getThreadById(useCasePayload.thread_id);
      await this._commentRepository.getCommentById(useCasePayload.comment_id);
      const reply = new Reply(useCasePayload);
      return this._replyRepository.addReply(reply);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AddReplyUseCase;
