const Thread = require('../../Domains/threads/entities/Thread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addThread = new Thread(useCasePayload);
    await this._threadRepository.verifyAvailableTitle(addThread.title);
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
