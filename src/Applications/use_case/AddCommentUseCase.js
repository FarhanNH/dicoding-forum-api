const Comment = require('../../Domains/comments/entities/Comment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    try {
      await this._userRepository.getUserById(useCasePayload.owner);
      await this._threadRepository.getThreadById(useCasePayload.thread_id);
      const comment = new Comment(useCasePayload);
      return this._commentRepository.addComment(comment);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AddCommentUseCase;
