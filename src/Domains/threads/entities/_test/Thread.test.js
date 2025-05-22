const Thread = require('../Thread');

describe('a Thread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'abc',
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: true,
      owner: 4234234,
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 50 character', () => {
    // Arrange
    const payload = {
      title: 'ohohohohohohohohohohhohohohohhohohohoohohohohohohohohohohhohohohohhohohoho',
      body: 'test body',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('ADD_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create addThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'First Thread',
      body: 'Lorem ipsum dolor sit amet tempor justo magna lorem clita consequat nam ipsum duis ut aliquyam erat sadipscing et. Et vel sed lorem sea sed clita dolore sit dolore et diam dolore doming no sed et. Nulla dolore nibh soluta dolore dolor est nulla autem stet gubergren eum clita tation hendrerit facilisi amet amet clita. Sed dolor sanctus. Ipsum lorem consetetur sed zzril voluptua amet lorem ut minim feugait in ut qui adipiscing consequat sit sea nostrud. Erat amet sed. Eirmod sanctus stet et et te nonumy dolor dolor amet duo sanctus sea aliquyam zzril et illum delenit possim. Tincidunt et voluptua wisi invidunt feugiat facilisis enim. Aliquyam erat et congue duo enim elitr. Sit dolor voluptua sed vero duo autem facer et lorem eu ipsum clita invidunt sanctus ipsum et. Est magna dolore amet magna dolores magna est dolor vero. Diam eirmod dolore rebum et iriure aliquyam erat dolor nobis doming dolore. Minim velit invidunt accusam stet sed. Dolores ea dolor sit gubergren amet ipsum amet ipsum aliquyam iriure vel at dolores. Sanctus no sadipscing labore dolore nonumy sed ipsum no dolore. Augue tempor vel et labore lorem liber praesent consetetur et tempor et. Diam ut possim enim amet blandit facilisis dolore. Consetetur rebum stet et tempor nulla dolore ullamcorper dolores tempor vero elitr eum ipsum congue sed nonumy dolor.',
      owner: 'user-123',
    };

    // Action
    const { title, body, owner } = new Thread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
