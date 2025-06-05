const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const payload = {
      ...request.payload,
      owner: credentialId,
      thread_id: threadId,
      comment_id: commentId,
    };

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const AddedReply = await addReplyUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        AddedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(replyId, credentialId, threadId, commentId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
