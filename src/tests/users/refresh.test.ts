import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import { AppDataSource } from "../../config/data-source";

describe("POST /auth/refresh", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.destroy();
  });

  it("should return 401 if refresh token is missing", async () => {
    const response = await request(app).post("/auth/refresh").send();

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 401 if refresh token is invalid", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=invalidtoken`])
      .send();

    expect(response.statusCode).toBe(401);
  });
});
