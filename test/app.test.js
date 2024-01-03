const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

describe("Test the root path", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.mongodb_url, {
      useNewUrlParser: true,
    });
  });
  let token;
  let data = {
    username: "jagdeep singh",
    phone: 9365376200,
    email: "jagdeep.singh@gmail.com",
    password: "TRY@1more",
  };
  test("creating user account through /api/v1.3/signup", async () => {
    const response = await request(app).post("/api/v1.3/signup").send(data);
    expect(response.statusCode).toBe(201);
  });
  test("user login through /api/v1.3/Login", async () => {
    const response = await request(app).post("/api/v1.3/Login").send(data);
    expect(response.statusCode).toBe(201);
    console.log(response.body);
    token = response.body.token;
  });
  test("user login through /api/v1.3/isloggin", async () => {
    const response = await request(app)
      .get("/api/v1.3/isLoggedIn")
      .set("authorization", token);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });
});
