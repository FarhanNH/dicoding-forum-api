const Thread = require('../../Domains/threads/entities/Thread');

class AddThreadUseCase {
  constructor({ threadRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    try {
      await this._userRepository.getUserById(useCasePayload.owner);
      const addThread = new Thread(useCasePayload);
      await this._threadRepository.verifyAvailableTitle(addThread.title);
      return this._threadRepository.addThread(addThread);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AddThreadUseCase;
