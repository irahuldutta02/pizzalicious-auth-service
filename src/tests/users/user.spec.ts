import request from "supertest";
import { DataSource } from "typeorm";
import createJWKSMock from "mock-jwks";
import app from "../../app";
import { AppDataSource } from "../../config/data-source";
import { Roles } from "../../constants";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    // initialize database connection
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    // database delete and create
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    // delete & close database connection
    await connection.dropDatabase();
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 200", async () => {
      // act
      const accessToken = jwks.token({
        sub: "1",
        role: Roles.CUSTOMER,
      });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // assert
      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      // arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // act
      const userRepository = connection.getRepository("User");
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // assert
      expect(response.statusCode).toBe(200);
      expect((response.body as Record<string, string>).id).toBe(data.id);
    });

    it("should not return the password", async () => {
      // arrange
      const userData = {
        firstName: "Rafael",
        lastName: "Dias",
        email: "rdtech2002@gmail.com",
        password: "12345678",
      };

      // act
      const userRepository = connection.getRepository("User");
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // assert
      expect(response.statusCode).toBe(200);
      expect(response.body).not.toHaveProperty("password");
    });
  });
});
