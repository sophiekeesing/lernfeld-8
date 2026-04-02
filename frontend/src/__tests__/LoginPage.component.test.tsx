import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../components/LoginPage";
import * as authService from "../services/auth";

// Mock the auth service
vi.mock("../services/auth");

// Create a test group for the LoginPage component
describe("LoginPage Component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.loginUrl).mockReturnValue("http://mocked-auth-url");
  });

  // subgroup of tests related to rendering
  describe("Rendering", () => {
    it("should render the login page container", () => {
      const { container } = render(<LoginPage />);
      expect(container.querySelector(".login-page")).toBeInTheDocument();
    });

    it("should render the login card", () => {
      const { container } = render(<LoginPage />);
      expect(container.querySelector(".login-card")).toBeInTheDocument();
    });

    it("should render the Trainify title with emoji", () => {
      render(<LoginPage />);
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("🚆🎵 Trainify");
    });

    it("should render the description text", () => {
      render(<LoginPage />);
      expect(
        screen.getByText(
          /Generate a Spotify playlist that perfectly matches your train journey/,
        ),
      ).toBeInTheDocument();
    });
  });

  // subgroup of tests related to the login button
  describe("Login Button", () => {
    it("should render login button as a link", () => {
      render(<LoginPage />);
      const loginLink = screen.getByRole("link", {
        name: /Login with Spotify/,
      });
      expect(loginLink).toBeInTheDocument();
    });

    it("should link to the correct authentication URL", () => {
      render(<LoginPage />);
      const loginLink = screen.getByRole("link", {
        name: /Login with Spotify/,
      });
      expect(loginLink).toHaveAttribute("href", "http://mocked-auth-url");
    });

    it("should have the login-btn CSS class", () => {
      render(<LoginPage />);
      const loginLink = screen.getByRole("link", {
        name: /Login with Spotify/,
      });
      expect(loginLink).toHaveClass("login-btn");
    });

    it("should call loginUrl from auth service", () => {
      render(<LoginPage />);
      expect(authService.loginUrl).toHaveBeenCalled();
    });
  });

  // subgroup of tests related to accessibility
  describe("Accessibility", () => {
    it("should have accessible heading hierarchy", () => {
      render(<LoginPage />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("should have accessible link with descriptive text", () => {
      render(<LoginPage />);
      const loginLink = screen.getByRole("link", {
        name: /Login with Spotify/,
      });
      expect(loginLink).toHaveAccessibleName();
    });

    it("should maintain logical content structure", () => {
      const { container } = render(<LoginPage />);
      const card = container.querySelector(".login-card");
      const children = Array.from(card?.children || []);

      // Verify structure: h1 -> p -> a
      expect(children[0]?.tagName).toBe("H1");
      expect(children[1]?.tagName).toBe("P");
      expect(children[2]?.tagName).toBe("A");
    });
  });

  // subgroup of tests related to user interactions
  describe("User Interactions", () => {
    it("should be clickable", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const loginLink = screen.getByRole("link", {
        name: /Login with Spotify/,
      });
      expect(loginLink).toBeEnabled();

      // Verify link is keyboard accessible
      await user.tab();
      expect(loginLink).toHaveFocus();
    });
  });

  // subgroup of tests related to CSS classes
  describe("CSS Classes", () => {
    it("should apply correct CSS classes to all elements", () => {
      const { container } = render(<LoginPage />);

      expect(container.querySelector(".login-page")).toBeInTheDocument();
      expect(container.querySelector(".login-card")).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveClass("login-btn");
    });
  });
});
