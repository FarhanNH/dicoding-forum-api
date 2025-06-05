const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadByIdHandler = this.getDetailThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const payload = { ...request.payload, owner: credentialId };
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread: detailThread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
