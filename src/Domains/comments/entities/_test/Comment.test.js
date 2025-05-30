const Comment = require('../Comment');

describe('a Comment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payloads = [{}, { content: 'test' }, { content: 'test', owner: 'user-123' }, { content: 'test', owner: 'user-123', thread_id: 'thread-123' }];

    // Action & Assert
    payloads.forEach((payload) => {
      expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payloads = [
      { content: 123, owner: 'user-123', thread_id: 'thread-123', is_delete: false },
      { content: 'test', owner: true, thread_id: 'thread-123', is_delete: false },
      { content: 'test', owner: 'user-123', thread_id: 123, is_delete: false },
      { content: 'test', owner: 'user-123', thread_id: 'thread-123', is_delete: 'false' },
    ];

    // Action & Assert
    payloads.forEach((payload) => {
      expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  it('should throw error when string properties are empty', () => {
    // Arrange
    const payloads = [
      { content: '', owner: 'user-123', thread_id: 'thread-123', is_delete: false },
      { content: '   ', owner: 'user-123', thread_id: 'thread-123', is_delete: false },
      { content: 'test', owner: '', thread_id: 'thread-123', is_delete: false },
      { content: 'test', owner: 'user-123', thread_id: '', is_delete: false },
    ];

    // Action & Assert
    payloads.forEach((payload) => {
      expect(() => new Comment(payload)).toThrowError('COMMENT.INVALID_STRING');
    });
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Ini komentar',
      owner: 'user-12323',
      thread_id: 'thread-12323',
      is_delete: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment.thread_id).toEqual(payload.thread_id);
    expect(comment.is_delete).toEqual(payload.is_delete);
  });
});
