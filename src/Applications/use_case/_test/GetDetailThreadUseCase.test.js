const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetDetailThreadUseCase = require("../GetDetailThreadUseCase");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("GetDetailThreadUseCase", () => {
  it("should orchectrating the get detail thread action correctly", async () => {
    // Arrange
    const useCaseParams = {
      threadId: DUMMY.THREAD_ID,
    };

    const expectedDetailReply = [
      {
        id: DUMMY.REPLY_ID,
        content: DUMMY.REPLY_CONTENT,
        date: DUMMY.DATE,
        username: DUMMY.USER_USERNAME,
        is_delete: true,
      },
    ];

    const expectedComment = [
      {
        id: DUMMY.COMMENT_ID,
        username: DUMMY.USER_USERNAME,
        date: DUMMY.DATE,
        content: DUMMY.COMMENT_CONTENT,
        is_delete: true,
        replies: expectedDetailReply,
      },
    ];

    const expectedDetailThread = {
      id: DUMMY.THREAD_ID,
      title: DUMMY.THREAD_TITLE,
      body: DUMMY.THREAD_BODY,
      date: DUMMY.DATE,
      username: DUMMY.USER_USERNAME,
      comments: expectedComment,
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn(() => expectedDetailThread);
    mockCommentRepository.getCommentByThreadId = jest.fn(() => expectedComment);
    mockCommentRepository.getCommentByThreadId = jest.fn(() =>
      Promise.resolve(
        expectedComment.map((comment) => {
          comment.content = comment.deleted ? "**komentar telah dihapus**" : comment.content;
          return comment;
        })
      )
    );
    mockReplyRepository.getRepliesByThreadId = jest.fn(() =>
      Promise.resolve(
        expectedDetailReply.map((reply) => {
          reply.content = reply.deleted ? "**balasan telah dihapus**" : reply.content;
          return reply;
        })
      )
    );

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCaseParams);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(detailThread).toEqual(expectedDetailThread);
  });
});
