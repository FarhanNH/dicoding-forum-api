const Comment = require('../../../Domains/comments/entities/Comment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchectrating the add comment action correctly', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'First Thread',
      body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      owner: mockUser.id,
    };

    const useCasePayload = {
      content: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      owner: mockUser.id,
      thread_id: mockThread.id,
    };

    const mockComment = {
      id: 'comment-123',
      ...useCasePayload,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.addUser = jest.fn().mockImplementation(() => Promise.resolve(useCasePayload.owner));
    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve(useCasePayload.owner));
    mockThreadRepository.verifyAvailableTitle = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread.id));
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockComment));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual({
      id: mockComment.id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      thread_id: useCasePayload.thread_id,
    });
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new Comment({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        thread_id: useCasePayload.thread_id,
      })
    );
  });
});
