const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should throw error when payload do not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Ini balasan',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload do not meet data type', () => {
    // Arrange
    const payload = {
      content: true,
      owner: 123,
      thread_id: 123,
      comment_id: 123,
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create reply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Ini balasan',
      owner: 'user-123',
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply.content).toEqual(payload.content);
  });
});
