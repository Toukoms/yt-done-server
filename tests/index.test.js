const request = require("supertest");
const app = require("../index"); // Adjust if the app is exported differently
const fs = require("fs");
const path = require("path");

describe("API Tests", () => {
  let server;

  beforeAll(() => {
    server = app.listen(4000); // Start the server on a test port
  });

  afterAll((done) => {
    server.close(done); // Close the server after tests
  });
  describe("GET /info", () => {
    it("should return video info for a valid URL", async () => {
      const response = await request(app)
        .get("/info")
        .query({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("thumbnail");
      expect(response.body).toHaveProperty("videoAudioFormats");
      expect(response.body).toHaveProperty("audioFormats");
    }, 30000);

    it("should return 400 for missing URL", async () => {
      const response = await request(app).get("/info");
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Missing URL");
    });
  });

  describe("GET /download", () => {
    it("should return 400 for missing parameters", async () => {
      const response = await request(app).get("/download");
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Missing Params");
    });

    it("should return 500 for invalid download request", async () => {
      const response = await request(app).get("/download").query({
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        format_id: "invalid_format",
      });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Error downloading file");
    }, 120000);

    it("should return 200 after download request finished", async () => {
      const response = await request(app).get("/download").query({
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        format_id: "18",
        title: "Rick",
      });
      expect(response.status).toBe(200);
    }, 30000);
  });
});
