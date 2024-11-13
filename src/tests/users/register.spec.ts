import bcrypt from "bcrypt";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../config/data-source";
import { Roles } from "../../constants";
import { User } from "../../entity/User";
import { truncateTables } from "../utils";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    // initialize database connection
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // database truncate
    await truncateTables(connection);
  });

  afterAll(async () => {
    // close database connection
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });

    it("should persist the user in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });

    it("should return the id of the user", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");

      const repository = connection.getRepository(User);
      const users = await repository.find();
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });

    it("should assign the user role", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store hashed password", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("password");
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
    });

    it("should return 400 if email already exists", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Fields Validation", () => {
    it("should return 400 if firstName is missing", async () => {
      // Arrange
      const userData = {
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if lastName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if email is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if email is invalid", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if email is empty string", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "",
        password: "12345678",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 if password is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("password should be at least 8 chars", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "1234567",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should trim email before saving", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: " rdtech2002@gmail.com ",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("email");
      expect(users[0].email).toBe("rdtech2002@gmail.com");
    });

    it("should trim firstName before saving", async () => {
      // Arrange
      const userData = {
        firstName: " Rafael ",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("firstName");
      expect(users[0].firstName).toBe("Rafael");
    });

    it("should trim lastName before saving", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: " Dias ",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("lastName");
      expect(users[0].lastName).toBe("Dias");
    });

    it("should trim password before saving", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: " 12345678 ",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("password");
      const isMatch = await bcrypt.compare("12345678", users[0].password);
      expect(isMatch).toBe(true);
    });
  });
});
