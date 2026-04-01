import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAccessToken, loginUrl, logout } from "../services/auth";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("loginUrl", () => {
  it("returns the backend login URL", () => {
    expect(loginUrl()).toBe("http://127.0.0.1:3001/auth/login");
  });
});

describe("getAccessToken", () => {
  it("returns the access token when authenticated", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "mock-token-123" }),
    } as Response);

    const token = await getAccessToken();
    expect(token).toBe("mock-token-123");
  });

  it("returns null when not authenticated", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    const token = await getAccessToken();
    expect(token).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    const token = await getAccessToken();
    expect(token).toBeNull();
  });
});

describe("logout", () => {
  it("calls the logout endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await logout();

    expect(fetchSpy).toHaveBeenCalledWith("http://127.0.0.1:3001/auth/logout", {
      method: "POST",
    });
  });
});
