import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import request from "supertest";
import app from "../../app";
import { isJwt } from "../utils";
import { RefreshToken } from "../../entity/RefreshToken";
import { User } from "../../entity/User";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    // initialize database connection
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // database delete and create
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    // close database connection
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 200", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.status).toBe(200);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });

    it("should return the id of the user", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");

      const repository = connection.getRepository(User);
      const users = await repository.find();
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });

    it("should return 400 if password is invalid", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "1234567",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should return 400 if user does not exist", async () => {
      // Arrange
      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should return the access token and refresh token inside a cookie", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      interface Headers {
        ["set-cookie"]: string[];
      }

      // Assert
      let accessToken = null;
      let refreshToken = null;
      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should store the refresh token in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // assert
      const refreshTokenRepo = connection.getRepository(RefreshToken);

      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();

      expect(tokens).toHaveLength(2);
    });
  });

  describe("Fields Validation", () => {
    it("should return 400 if email is missing", async () => {
      // Arrange
      const logInUserData = {
        password: "12345678",
      };

      // Act
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should return 400 if password is missing", async () => {
      // Arrange
      const logInUserData = {
        email: "rdtech2002@gmail.com",
      };

      // Act
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should return 400 if email is empty string", async () => {
      // Arrange
      const logInUserData = {
        email: "",
        password: "12345678",
      };

      // Act
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.status).toBe(400);
    });

    it("should trim email before searching", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: " rdtech2002@gmail.com ",
        password: "12345678",
      };

      const logInUserData = {
        email: " rdtech2002@gmail.com ",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");

      const repository = connection.getRepository(User);
      const users = await repository.find();
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });

    it("should trim password before matching", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      const logInUserData = {
        email: "rdtech2002@gmail.com",
        password: " 12345678 ",
      };

      // Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(logInUserData);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");

      const repository = connection.getRepository(User);
      const users = await repository.find();
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });
  });
});
