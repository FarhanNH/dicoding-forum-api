const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');
const NotFoundError = require('../NotFoundError');
const AuthenticationError = require('../AuthenticationError');
const AuthorizationError = require('../AuthorizationError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('harus mengirimkan username dan password'));
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('username dan password harus string'));
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN'))).toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('refresh token harus string'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN'))).toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('refresh token harus string'));
    expect(DomainErrorTranslator.translate(new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('harus mengirimkan title dan body'));
    expect(DomainErrorTranslator.translate(new Error('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('title dan body harus string'));
    expect(DomainErrorTranslator.translate(new Error('THREAD.TITLE_LIMIT_CHAR'))).toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena karakter title melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('THREAD_REPOSITORY.TITLE_ALREADY_EXISTS'))).toStrictEqual(new InvariantError('title tidak tersedia'));
    expect(DomainErrorTranslator.translate(new Error('THREAD.THREAD_NOT_FOUND'))).toStrictEqual(new NotFoundError('thread tidak tersedia'));
    expect(DomainErrorTranslator.translate(new Error('THREAD.AUTHENTICATION_NOT_FOUND'))).toStrictEqual(new AuthenticationError('tidak memiliki akses'));
    expect(DomainErrorTranslator.translate(new Error('THREAD.AUTHORIZATION_NOT_FOUND'))).toStrictEqual(new AuthorizationError('tidak memiliki akses'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('harus mengirimkan content'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('content harus string'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT.THREAD_NOT_FOUND'))).toStrictEqual(new NotFoundError('comment tidak tersedia'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT.AUTHENTICATION_NOT_FOUND'))).toStrictEqual(new AuthenticationError('tidak memiliki akses'));
    expect(DomainErrorTranslator.translate(new Error('COMMENT.AUTHORIZATION_NOT_FOUND'))).toStrictEqual(new AuthorizationError('tidak memiliki akses'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
