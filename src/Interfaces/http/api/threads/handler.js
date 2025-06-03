const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadCommentUseCase = require('../../../../Applications/use_case/GetThreadCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadCommentByIdHandler = this.getThreadCommentByIdHandler.bind(this);
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

  async getThreadCommentByIdHandler(request, h) {
    const { threadId } = request.params;
    const getThreadCommentUseCase = this._container.getInstance(GetThreadCommentUseCase.name);
    const detailThread = await getThreadCommentUseCase.execute(threadId);

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
