const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should throw error when use case payload do not contain needed property', async () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(payload.commentId, payload.threadId)).rejects.toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when use case payload do not meet data type', async () => {
    // Arrange
    const payload = {
      commentId: 123,
      threadId: [],
      userId: true,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    expect(deleteCommentUseCase.execute(payload.commentId, payload.threadId, payload.userId)).rejects.toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the deleteComment action correctly', async () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    // prepare dependencies (mocking needed class)
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // mocking needed functions
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.softDeleteComment = jest.fn().mockImplementation(() => Promise.resolve());

    // create use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(payload.commentId, payload.threadId, payload.userId);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(payload.commentId, payload.userId);
    expect(mockCommentRepository.softDeleteComment).toHaveBeenCalledWith(payload.commentId);
  });
});
