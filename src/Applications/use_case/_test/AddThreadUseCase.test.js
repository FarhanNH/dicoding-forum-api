const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
    };

    const useCasePayload = {
      title: 'First Thread',
      body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      owner: mockUser.id,
    };

    const mockAddedThread = {
      id: 'thread-123',
      ...useCasePayload,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockUserRepository.addUser = jest.fn().mockImplementation(() => Promise.resolve(useCasePayload.owner));
    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve(useCasePayload.owner));
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    });
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new Thread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
  });
});
