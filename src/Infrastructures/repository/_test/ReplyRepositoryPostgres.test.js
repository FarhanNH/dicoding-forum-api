const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should throw error when payload not contain needed property', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      const invalidPayloads = [{ thread_id: 'thread-123', content: 'content' }, { comment_id: 'comment-123', content: 'content' }, { owner: 'user-123', content: 'content' }, { content: 'content', owner: 'user-123', thread_id: 'thread-123' }, {}];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(replyRepository.addReply(payload)).rejects.toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
        })
      );
    });

    it('should throw error when payload not meet data type specification', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, () => '123');
      const invalidPayloads = [
        { content: 'content', owner: 123, thread_id: 'thread-123', comment_id: 'comment-123' },
        { content: 'content', owner: 'user-123', thread_id: 123, comment_id: 'comment-123' },
        { content: 123, owner: 'user-123', thread_id: 'thread-123', comment_id: 'comment-123' },
      ];

      // Action & Assert
      await Promise.all(
        invalidPayloads.map(async (payload) => {
          await expect(replyRepository.addReply(payload)).rejects.toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
        })
      );
    });

    it('should persist add reply and return reply correctly', async () => {
      // Arrange
      const mockReply = {
        content: 'Ini balasan',
        owner: 'user-123',
        thread_id: 'thread-123',
        comment_id: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: mockReply.owner });
      await ThreadsTableTestHelper.addThread({ id: mockReply.thread_id, owner: mockReply.owner });
      await CommentsTableTestHelper.addComment({ id: mockReply.comment_id, owner: mockReply.owner });
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepository.addReply(mockReply);

      // Assert
      const reply = await RepliesTableTestHelper.getReplyById('reply-123');
      expect(reply).toHaveLength(1);
      expect(reply[0].is_delete).toBe(false);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const mockReply = {
        content: 'Ini balasan',
        owner: 'user-123',
        thread_id: 'thread-123',
        comment_id: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: mockReply.owner });
      await ThreadsTableTestHelper.addThread({ id: mockReply.thread_id, owner: mockReply.owner });
      await CommentsTableTestHelper.addComment({ id: mockReply.comment_id, owner: mockReply.owner });
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await replyRepository.addReply(mockReply);

      // Assert
      expect(result).toStrictEqual({
        id: 'reply-123',
        content: 'Ini balasan',
        owner: 'user-123',
      });
    });
  });

  describe('getReplyById function', () => {
    it('should throw NotFoundError when reply is not found', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.getReplyById('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return content when reply is found', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      // Action
      const reply = await replyRepository.getReplyById('reply-123');

      // Assert
      expect(reply.content).toBe('Ini balasan');
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const payload = {
        id: 'reply-123',
        owner: 'user-123',
      };
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(payload)).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner not verified', async () => {
      // Arrange
      const payload = {
        id: 'reply-123',
        owner: 'user-321',
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(payload)).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw NotFoundError and Authorization error when payload is correct', async () => {
      // Arrange
      const payload = {
        id: 'reply-123',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyOwner(payload)).resolves.not.toThrowError(AuthorizationError, NotFoundError);
    });
  });

  describe('deleteReplyBydId function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const payload = {
        id: 'reply-123',
      };

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.deleteReplyById(payload)).rejects.toThrowError(NotFoundError);
    });

    it('should change is_delete in replies table to be true', async () => {
      // Arrange
      const payload = {
        id: 'reply-123',
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await replyRepository.deleteReplyById(payload.id);

      // Action & Assert
      const reply = await RepliesTableTestHelper.getReplyById(payload.id);
      expect(reply[0].is_delete).toBe(true);
    });
  });
});
