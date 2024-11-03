import request from "supertest";
import app from "../../app";

describe("POST /auth/register", () => {
  describe("Given all fields", () => {
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
  });
  describe("Fields missing", () => {});
});
