const Comment = require("../../../Domains/comments/entities/Comment");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const AddCommentUseCase = require("../AddCommentUseCase");
const { DUMMY } = require("../../../../src/Commons/utils/Constants");

describe("AddCommentUseCase", () => {
  it("should orchectrating the add comment action correctly", async () => {
    // Arrange
    const mockUser = {
      id: DUMMY.OWNER,
    };

    const mockThread = {
      id: DUMMY.THREAD_ID,
      title: DUMMY.THREAD_TITLE,
      body: DUMMY.THREAD_BODY,
      owner: mockUser.id,
    };

    const useCasePayload = {
      content: DUMMY.THREAD_BODY,
      owner: mockUser.id,
      thread_id: mockThread.id,
    };

    const mockComment = {
      id: DUMMY.COMMENT_ID,
      ...useCasePayload,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve(useCasePayload.owner));
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread.id));
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.getUserById).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new Comment({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        thread_id: useCasePayload.thread_id,
      })
    );
    expect(addedComment).toStrictEqual({
      id: mockComment.id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      thread_id: useCasePayload.thread_id,
    });
  });
});
