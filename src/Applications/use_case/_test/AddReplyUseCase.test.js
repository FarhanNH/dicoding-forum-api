const UserRepository = require('../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const Reply = require('../../../Domains/replies/entities/Reply');

describe('AddReplyUseCase', () => {
  it('should orchectrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Ini balasan',
      owner: 'user-123',
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    const mockAddedReply = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn().mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);
    expect(addedReply).toStrictEqual({
      id: mockAddedReply.id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new Reply({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        thread_id: useCasePayload.thread_id,
        comment_id: useCasePayload.comment_id,
      })
    );
  });
});
