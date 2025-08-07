const Thread = require("../../../Domains/threads/entities/Thread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const AddThreadUseCase = require("../AddThreadUseCase");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const mockUser = {
      id: DUMMY.USER_ID,
      username: DUMMY.USER_USERNAME,
      fullname: DUMMY.USER_FULLNAME,
    };

    const useCasePayload = {
      title: DUMMY.THREAD_TITLE,
      body: DUMMY.THREAD_BODY,
      owner: mockUser.id,
    };

    const mockAddedThread = {
      id: DUMMY.THREAD_ID,
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve(mockUser));
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new Thread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
    expect(addedThread).toStrictEqual({
      id: DUMMY.THREAD_ID,
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });
  });
});
