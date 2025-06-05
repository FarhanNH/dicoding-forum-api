const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyUseCase', () => {
  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      owner: 'user-123',
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(deleteReplyUseCase.execute(payload.replyId, payload.owner)).rejects.toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', async () => {
    // Arrange
    const payload = {
      replyId: 123,
      owner: {},
      thread_id: [],
      comment_id: true,
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    expect(deleteReplyUseCase.execute(payload.replyId, payload.owner, payload.thread_id, payload.comment_id)).rejects.toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the DeleteReply correctly', async () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      owner: 'user-123',
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };
    const mockVerifyReply = {
      id: payload.replyId,
      owner: payload.owner,
    };

    // mock needed repository class
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // mock needed repository function
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(payload.replyId, payload.owner, payload.thread_id, payload.comment_id);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(payload.thread_id);
    expect(mockCommentRepository.getCommentById).toHaveBeenCalledWith(payload.comment_id);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(mockVerifyReply);
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(payload.replyId);
  });
});
