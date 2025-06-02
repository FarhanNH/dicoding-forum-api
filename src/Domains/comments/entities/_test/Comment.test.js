const Comment = require('../Comment');

describe('Comment entities', () => {
  it('should throw error when payload do not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'content',
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload do not meet data type', () => {
    // Arrange
    const payload = {
      content: true,
      thread_id: [],
      owner: {},
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      content: 'content',
      thread_id: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.content).toEqual(payload.content);
  });
});
