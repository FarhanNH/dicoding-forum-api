const DUMMY_USER_ID = "user-123";
const DUMMY_CONTENT = "Lorem ipsum dolor sit amet clita et diam blandit. Vel lorem eu magna et amet no takimata facilisi cum liber no soluta aliquam vel. Dolore sit cum dolor ipsum congue et. Nonumy duo elitr ut consequat dolores lorem velit sed illum consetetur magna vulputate vel ea dolore ad.";
const NEW_DATE = new Date().toISOString();
const DUMMY = {
  USER_ID: DUMMY_USER_ID,
  USER_USERNAME: "dicoding",
  USER_FULLNAME: "Dicoding Indonesia",
  USER_PASSWORD: "secret_password",
  THREAD_ID: "thread-123",
  THREAD_TITLE: "First Thread",
  THREAD_BODY: DUMMY_CONTENT,
  THREAD_DATE: NEW_DATE,
  COMMENT_ID: "comment-123",
  COMMENT_CONTENT: DUMMY_CONTENT,
  REPLY_ID: "reply-123",
  REPLY_CONTENT: DUMMY_CONTENT,
  OWNER: DUMMY_USER_ID,
  OWNER_OTHER: "user-321",
  DATE: NEW_DATE,
};

module.exports = {
  DUMMY,
  NEW_DATE,
};
