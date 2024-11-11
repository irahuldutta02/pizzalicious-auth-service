import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../config/data-source";
import { truncateTables } from "../utils";
import { User } from "../../entity/User";

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
    // check if the endpoint returns 201
    it("should return 201", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "123456",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    // check if the endpoint returns json
    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "123456",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });

    // check the database connection
    it("should persist the user in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "123456",
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

    // check if the endpoint returns the id of the user
    it("should return the id of the user", async () => {
      // Arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "123456",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
    });
  });

  describe("Fields missing", () => {
    // Add tests for missing fields
  });
});
