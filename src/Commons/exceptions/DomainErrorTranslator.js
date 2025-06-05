const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');
const AuthenticationError = require('./AuthenticationError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan title dan body'),
  'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('title dan body harus string'),
  'THREAD.TITLE_LIMIT_CHAR': new InvariantError('tidak dapat membuat thread baru karena karakter title melebihi batas limit'),
  'THREAD_REPOSITORY.TITLE_ALREADY_EXISTS': new InvariantError('title tidak tersedia'),
  'THREAD.THREAD_NOT_FOUND': new NotFoundError('thread tidak tersedia'),
  'THREAD.AUTHENTICATION_NOT_FOUND': new AuthenticationError('tidak memiliki akses'),
  'THREAD.AUTHORIZATION_NOT_FOUND': new AuthorizationError('tidak memiliki akses'),
  'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan content'),
  'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus string'),
  'COMMENT.THREAD_NOT_FOUND': new NotFoundError('comment tidak tersedia'),
  'COMMENT.AUTHENTICATION_NOT_FOUND': new AuthenticationError('tidak memiliki akses'),
  'COMMENT.AUTHORIZATION_NOT_FOUND': new AuthorizationError('tidak memiliki akses'),
  'REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan content'),
  'REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus string'),
  'REPLY.THREAD_NOT_FOUND': new NotFoundError('reply tidak tersedia'),
  'REPLY.AUTHENTICATION_NOT_FOUND': new AuthenticationError('tidak memiliki akses'),
  'REPLY.AUTHORIZATION_NOT_FOUND': new AuthorizationError('tidak memiliki akses'),
};

module.exports = DomainErrorTranslator;
