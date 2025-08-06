const UserRepository = require("../../../Domains/users/UserRepository");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthenticationTokenManager = require("../../security/AuthenticationTokenManager");
const PasswordHash = require("../../security/PasswordHash");
const LoginUserUseCase = require("../LoginUserUseCase");
const NewAuth = require("../../../Domains/authentications/entities/NewAuth");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("GetAuthenticationUseCase", () => {
  it("should orchestrating the get authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: DUMMY.USER_USERNAME,
      password: DUMMY.USER_PASSWORD,
    };
    const mockedAuthentication = new NewAuth({
      accessToken: "access_token",
      refreshToken: "refresh_token",
    });
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    // Mocking
    mockUserRepository.getPasswordByUsername = jest.fn().mockImplementation(() => Promise.resolve("encrypted_password"));
    mockPasswordHash.comparePassword = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.createAccessToken = jest.fn().mockImplementation(() => Promise.resolve(mockedAuthentication.accessToken));
    mockAuthenticationTokenManager.createRefreshToken = jest.fn().mockImplementation(() => Promise.resolve(mockedAuthentication.refreshToken));
    mockUserRepository.getIdByUsername = jest.fn().mockImplementation(() => Promise.resolve(DUMMY.USER_ID));
    mockAuthenticationRepository.addToken = jest.fn().mockImplementation(() => Promise.resolve());

    // create use case instance
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualAuthentication = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.getPasswordByUsername).toBeCalledWith(DUMMY.USER_USERNAME);
    expect(mockPasswordHash.comparePassword).toBeCalledWith(DUMMY.USER_PASSWORD, "encrypted_password");
    expect(mockUserRepository.getIdByUsername).toBeCalledWith(DUMMY.USER_USERNAME);
    expect(mockAuthenticationTokenManager.createAccessToken).toBeCalledWith({ username: DUMMY.USER_USERNAME, id: DUMMY.USER_ID });
    expect(mockAuthenticationTokenManager.createRefreshToken).toBeCalledWith({ username: DUMMY.USER_USERNAME, id: DUMMY.USER_ID });
    expect(mockAuthenticationRepository.addToken).toBeCalledWith(mockedAuthentication.refreshToken);
    expect(actualAuthentication).toEqual(
      new NewAuth({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      })
    );
  });
});
