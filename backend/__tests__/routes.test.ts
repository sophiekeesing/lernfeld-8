import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, _resetTokenData, _setTokenData } from "../app.js";

beforeEach(() => {
  _resetTokenData();
});

describe("GET /auth/login", () => {
  it("redirects to Spotify authorization", async () => {
    const res = await request(app).get("/auth/login");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("accounts.spotify.com/authorize");
    expect(res.headers.location).toContain("client_id=");
  });
});

describe("GET /auth/token", () => {
  it("returns 401 when no token is stored", async () => {
    const res = await request(app).get("/auth/token");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Not authenticated");
  });

  it("returns access token when authenticated", async () => {
    _setTokenData({
      access_token: "test-access-token",
      expires_in: 3600,
      obtained_at: Date.now(),
    });

    const res = await request(app).get("/auth/token");
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBe("test-access-token");
  });
});

describe("POST /auth/logout", () => {
  it("clears the token and returns ok", async () => {
    _setTokenData({
      access_token: "token",
      expires_in: 3600,
      obtained_at: Date.now(),
    });

    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // Verify token is cleared
    const tokenRes = await request(app).get("/auth/token");
    expect(tokenRes.status).toBe(401);
  });
});

describe("GET /api/trip", () => {
  it("returns 400 when missing query params", async () => {
    const res = await request(app).get("/api/trip");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing");
  });

  it("returns 400 when only 'from' is provided", async () => {
    const res = await request(app).get("/api/trip?from=Hamburg");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing");
  });
});

describe("GET /auth/callback", () => {
  it("redirects with error when error param is present", async () => {
    const res = await request(app).get("/auth/callback?error=access_denied");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("error=access_denied");
  });

  it("redirects with error when no code param", async () => {
    const res = await request(app).get("/auth/callback");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("error=no_code");
  });
});
