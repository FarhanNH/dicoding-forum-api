const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchectrating the get thread with comment action correctly', async () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
    };
    const newDate = new Date().toISOString();

    const mockReply = {
      id: 'reply-123',
      content: 'Ini balasan',
      date: newDate,
      username: 'dicoding',
    };

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
          replies: [mockReply],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getDetailThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockReplyRepository.getRepliesFromComment = jest.fn().mockImplementation(() => Promise.resolve(mockReply));

    /** creating use case instance */
    const getDetailThreadById = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadComment = await getDetailThreadById.execute(payload.threadId);

    // Assert
    expect(threadComment).toStrictEqual({
      id: mockThread.id,
      title: mockThread.title,
      body: mockThread.body,
      date: mockThread.date,
      username: mockThread.username,
      comments: mockThread.comments,
    });

    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledWith(payload.threadId);
    expect(mockReplyRepository.getRepliesFromComment).toHaveBeenCalledWith(mockThread.comments[0].id);
  });
});
