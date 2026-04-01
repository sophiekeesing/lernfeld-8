import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "../components/LoginPage";

describe("LoginPage", () => {
  it("renders the app title", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Trainify/)).toBeInTheDocument();
  });

  it("renders the login button with Spotify link", () => {
    render(<LoginPage />);
    const link = screen.getByText("Login with Spotify");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "http://127.0.0.1:3001/auth/login",
    );
  });

  it("renders a description", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Generate a Spotify playlist/)).toBeInTheDocument();
  });
});
