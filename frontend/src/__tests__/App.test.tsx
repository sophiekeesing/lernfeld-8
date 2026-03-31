import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

// Mock the auth service
vi.mock("../services/auth", () => ({
  getAccessToken: vi.fn(),
  loginUrl: () => "http://127.0.0.1:3001/auth/login",
}));

import { getAccessToken } from "../services/auth";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("shows loading state initially", () => {
    // Never resolve to keep it in loading state
    vi.mocked(getAccessToken).mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders LoginPage when not authenticated", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null);
    render(<App />);
    expect(await screen.findByText("Login with Spotify")).toBeInTheDocument();
  });

  it("renders TripForm when authenticated", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("mock-token");
    render(<App />);
    expect(await screen.findByText("Generate Playlist")).toBeInTheDocument();
  });
});
