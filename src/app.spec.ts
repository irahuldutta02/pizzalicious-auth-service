import app from "./app";
import request from "supertest";

describe("App", () => {
  it("Should return 200 status code", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(200);
  });
});
