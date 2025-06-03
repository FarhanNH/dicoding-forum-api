const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadCommentUseCase = require('../GetThreadCommentUseCase');

describe('GetThreadCommentUseCase', () => {
  it('should orchectrating the get thread with comment action correctly', async () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
    };
    const newDate = new Date().toISOString();

    const mockThread = {
      id: payload.threadId,
      title: 'First Thread',
      body: 'Lorem ipsum asdadadjakkafkahfkakfdajkfj',
      date: newDate,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: newDate,
          content: 'content',
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadCommentById = jest.fn().mockImplementation(() => Promise.resolve(mockThread));

    /** creating use case instance */
    const getThreadCommentById = new GetThreadCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const threadComment = await getThreadCommentById.execute(payload.threadId);

    // Assert
    expect(threadComment).toStrictEqual({
      id: mockThread.id,
      title: mockThread.title,
      body: mockThread.body,
      date: mockThread.date,
      username: mockThread.username,
      comments: mockThread.comments,
    });

    expect(mockThreadRepository.getThreadCommentById).toHaveBeenCalledWith(payload.threadId);
  });
});
