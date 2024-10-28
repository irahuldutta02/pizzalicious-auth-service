import app from "./app";
import { calculateDiscount } from "./utils";
import request from "supertest";

describe("App", () => {
  it("It should return correct discount", () => {
    const discount = calculateDiscount(100, 20);
    expect(discount).toBe(20);
  });

  it("Should return 200 status code", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(200);
  });
});
