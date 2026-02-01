import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UIContextProvider, useUI } from "../../app/context/UIContext";

// Test component that uses the UI context
const TestComponent = () => {
  const ui = useUI();
  return (
    <div>
      <div data-testid="loading">
        {ui.uiState.isLoading ? "loading" : "not-loading"}
      </div>
      <div data-testid="error">{ui.uiState.error ?? "no-error"}</div>
      <div data-testid="success">
        {ui.uiState.successMessage ?? "no-success"}
      </div>
      <button onClick={ui.showLoading} data-testid="show-loading-btn">
        Show Loading
      </button>
      <button onClick={ui.hideLoading} data-testid="hide-loading-btn">
        Hide Loading
      </button>
      <button
        onClick={() => ui.showError("Test error message")}
        data-testid="show-error-btn"
      >
        Show Error
      </button>
      <button
        onClick={() => ui.showSuccess("Test success message")}
        data-testid="show-success-btn"
      >
        Show Success
      </button>
      <button onClick={ui.clearMessages} data-testid="clear-messages-btn">
        Clear Messages
      </button>
    </div>
  );
};

describe("UIContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("UIContextProvider", () => {
    it("renders children correctly", () => {
      render(
        <UIContextProvider>
          <div data-testid="child">Child Content</div>
        </UIContextProvider>
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });

    it("initializes with correct default state", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      expect(screen.getByTestId("success")).toHaveTextContent("no-success");
    });
  });

  describe("showLoading", () => {
    it("sets isLoading to true", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      const showLoadingBtn = screen.getByTestId("show-loading-btn");
      fireEvent.click(showLoadingBtn);

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    });

    it("does not affect error or success state", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      const showLoadingBtn = screen.getByTestId("show-loading-btn");
      fireEvent.click(showLoadingBtn);

      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      expect(screen.getByTestId("success")).toHaveTextContent("no-success");
    });
  });

  describe("hideLoading", () => {
    it("sets isLoading to false", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // First show loading
      fireEvent.click(screen.getByTestId("show-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      // Then hide loading
      fireEvent.click(screen.getByTestId("hide-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    it("can be called when already not loading without error", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Hide loading without ever showing it
      fireEvent.click(screen.getByTestId("hide-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });
  });

  describe("showError", () => {
    it("sets error message", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      fireEvent.click(screen.getByTestId("show-error-btn"));

      expect(screen.getByTestId("error")).toHaveTextContent(
        "Test error message"
      );
    });

    it("clears success message when showing error", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // First show success
      fireEvent.click(screen.getByTestId("show-success-btn"));
      expect(screen.getByTestId("success")).toHaveTextContent(
        "Test success message"
      );

      // Then show error
      fireEvent.click(screen.getByTestId("show-error-btn"));
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Test error message"
      );
      expect(screen.getByTestId("success")).toHaveTextContent("no-success");
    });

    it("does not affect loading state", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      fireEvent.click(screen.getByTestId("show-error-btn"));

      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });
  });

  describe("showSuccess", () => {
    it("sets success message", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      fireEvent.click(screen.getByTestId("show-success-btn"));

      expect(screen.getByTestId("success")).toHaveTextContent(
        "Test success message"
      );
    });

    it("clears error message when showing success", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // First show error
      fireEvent.click(screen.getByTestId("show-error-btn"));
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Test error message"
      );

      // Then show success
      fireEvent.click(screen.getByTestId("show-success-btn"));
      expect(screen.getByTestId("success")).toHaveTextContent(
        "Test success message"
      );
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("does not affect loading state", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      fireEvent.click(screen.getByTestId("show-success-btn"));

      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });
  });

  describe("clearMessages", () => {
    it("clears error message", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Show error first
      fireEvent.click(screen.getByTestId("show-error-btn"));
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Test error message"
      );

      // Clear messages
      fireEvent.click(screen.getByTestId("clear-messages-btn"));
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("clears success message", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Show success first
      fireEvent.click(screen.getByTestId("show-success-btn"));
      expect(screen.getByTestId("success")).toHaveTextContent(
        "Test success message"
      );

      // Clear messages
      fireEvent.click(screen.getByTestId("clear-messages-btn"));
      expect(screen.getByTestId("success")).toHaveTextContent("no-success");
    });

    it("clears both error and success messages", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Show error (which clears success)
      fireEvent.click(screen.getByTestId("show-error-btn"));
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Test error message"
      );

      // Show success (which clears error)
      fireEvent.click(screen.getByTestId("show-success-btn"));
      expect(screen.getByTestId("success")).toHaveTextContent(
        "Test success message"
      );
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");

      // Clear messages
      fireEvent.click(screen.getByTestId("clear-messages-btn"));
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      expect(screen.getByTestId("success")).toHaveTextContent("no-success");
    });

    it("does not affect loading state", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Show loading
      fireEvent.click(screen.getByTestId("show-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      // Clear messages
      fireEvent.click(screen.getByTestId("clear-messages-btn"));

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    });
  });

  describe("useUI hook", () => {
    it("throws error when used outside of UIContextProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const InvalidComponent = () => {
        try {
          useUI();
          return <div>No error thrown</div>;
        } catch {
          return <div>Error caught</div>;
        }
      };

      render(<InvalidComponent />);

      expect(screen.getByText("Error caught")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("returns context value when used within UIContextProvider", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Should render without throwing
      expect(screen.getByTestId("loading")).toBeInTheDocument();
      expect(screen.getByTestId("error")).toBeInTheDocument();
      expect(screen.getByTestId("success")).toBeInTheDocument();
    });
  });

  describe("state transitions", () => {
    it("maintains loading state through multiple operations", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Show loading
      fireEvent.click(screen.getByTestId("show-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      // Show error (should not affect loading)
      fireEvent.click(screen.getByTestId("show-error-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Test error message"
      );

      // Show success (should not affect loading)
      fireEvent.click(screen.getByTestId("show-success-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      expect(screen.getByTestId("success")).toHaveTextContent(
        "Test success message"
      );

      // Clear messages (should not affect loading)
      fireEvent.click(screen.getByTestId("clear-messages-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      expect(screen.getByTestId("success")).toHaveTextContent("no-success");
    });

    it("handles multiple sequential loading toggles", () => {
      render(
        <UIContextProvider>
          <TestComponent />
        </UIContextProvider>
      );

      // Toggle loading multiple times
      fireEvent.click(screen.getByTestId("show-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      fireEvent.click(screen.getByTestId("hide-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");

      fireEvent.click(screen.getByTestId("show-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      fireEvent.click(screen.getByTestId("hide-loading-btn"));
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });
  });
});
