import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import request from "supertest";
import app from "../../app";
import { Tenant } from "../../entity/Tenant";

describe("POST /tenants", () => {
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
    // delete & close database connection
    await connection.dropDatabase();
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // Arrange
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };

      // Act
      const response = await request(app).post("/tenants").send(tenantData);

      // Assert
      expect(response.status).toBe(201);
    });

    it("should save the tenant in the database & should return the tenant id", async () => {
      // Arrange
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };

      // Act
      const response = await request(app).post("/tenants").send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();

      // Assert
      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
      expect(response.status).toBe(201);
      expect((response.body as Record<string, string>).id).toBe(tenant[0].id);
    });
  });
});
