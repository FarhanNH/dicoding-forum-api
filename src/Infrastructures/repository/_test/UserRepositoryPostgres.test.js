const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const RegisterUser = require("../../../Domains/users/entities/RegisterUser");
const RegisteredUser = require("../../../Domains/users/entities/RegisteredUser");
const UserRepositoryPostgres = require("../UserRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const { DUMMY } = require("../../../Commons/utils/Constants");

describe("UserRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyAvailableUsername function", () => {
    it("should throw InvariantError when username not available", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: DUMMY.USER_USERNAME });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername(DUMMY.USER_USERNAME)).rejects.toThrowError(InvariantError);
    });

    it("should not throw InvariantError when username available", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername(DUMMY.USER_USERNAME)).resolves.not.toThrowError(InvariantError);
    });
  });

  describe("addUser function", () => {
    it("should persist register user and return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: DUMMY.USER_USERNAME,
        password: DUMMY.USER_PASSWORD,
        fullname: DUMMY.USER_FULLNAME,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.getUserById(DUMMY.USER_ID);
      expect(users).toHaveLength(1);
    });

    it("should return registered user correctly", async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: DUMMY.USER_USERNAME,
        password: DUMMY.USER_PASSWORD,
        fullname: DUMMY.USER_FULLNAME,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(
        new RegisteredUser({
          id: DUMMY.USER_ID,
          username: DUMMY.USER_USERNAME,
          fullname: DUMMY.USER_FULLNAME,
        })
      );
    });
  });

  describe("getPasswordByUsername", () => {
    it("should throw InvariantError when user not found", () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(userRepositoryPostgres.getPasswordByUsername(DUMMY.USER_USERNAME)).rejects.toThrowError(InvariantError);
    });

    it("should return username password when user is found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        username: DUMMY.USER_USERNAME,
        password: DUMMY.USER_PASSWORD,
      });

      // Action & Assert
      const password = await userRepositoryPostgres.getPasswordByUsername(DUMMY.USER_USERNAME);
      expect(password).toBe(DUMMY.USER_PASSWORD);
    });
  });

  describe("getIdByUsername", () => {
    it("should throw InvariantError when user not found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername(DUMMY.USER_USERNAME)).rejects.toThrowError(InvariantError);
    });

    it("should return user id correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.OWNER_OTHER, username: DUMMY.USER_USERNAME });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const userId = await userRepositoryPostgres.getIdByUsername(DUMMY.USER_USERNAME);

      // Assert
      expect(userId).toEqual(DUMMY.OWNER_OTHER);
    });
  });

  describe("getUserById", () => {
    it("should throw InvariantError when user id not found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getUserById(DUMMY.USER_ID)).rejects.toThrowError(NotFoundError);
    });

    it("should return user id correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: DUMMY.USER_ID, username: DUMMY.USER_USERNAME });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const user = await userRepositoryPostgres.getUserById(DUMMY.USER_ID);

      // Assert
      expect(user.id).toEqual(DUMMY.USER_ID);
    });
  });
});
