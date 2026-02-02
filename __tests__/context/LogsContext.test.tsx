import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LogsContextProvider, useLogs } from "../../app/context/LogsContext";
import { OrganizedLogEntry } from "../../types/index";

// Mock Firebase and dependencies
const mockSubscribeToFriendsLogs = jest.fn();

jest.mock("../../app/_db/realtimeService", () => ({
  subscribeToFriendsLogs: (...args: unknown[]) =>
    mockSubscribeToFriendsLogs(...args),
}));

jest.mock("../../app/context/AuthContext", () => ({
  UserAuth: () => ({
    user: {
      uid: "test-user-id",
      displayName: "Test User",
    },
  }),
}));

// Test data
const mockLogs: OrganizedLogEntry[] = [
  {
    user: "Test User",
    duration: "30",
    createdAt: "2024-01-15T15:00:00.000Z",
    description: "Practice session 1",
    tags: ["guitar", "practice"],
  },
  {
    user: "Other User",
    duration: "45",
    createdAt: "2024-01-15T19:00:00.000Z",
    description: "Practice session 2",
    tags: ["piano", "warmup"],
  },
  {
    user: "Test User",
    duration: "60",
    createdAt: "2024-01-16T14:00:00.000Z",
    description: "Practice session 3",
    tags: ["guitar", "scales"],
  },
];

// Test component that uses the logs context
const TestComponent = () => {
  const logs = useLogs();
  return (
    <div>
      <div data-testid="loading">
        {logs.loading ? "loading" : "not-loading"}
      </div>
      <div data-testid="error">
        {logs.error ? logs.error.message : "no-error"}
      </div>
      <div data-testid="logs-count">{logs.logs.length}</div>
      <div data-testid="all-logs-count">{logs.allLogs.length}</div>
      <div data-testid="has-more">{logs.hasMore ? "has-more" : "no-more"}</div>
      <div data-testid="page">{logs.page}</div>
      <div data-testid="tag-filter">{logs.tagFilter || "no-filter"}</div>
      <div data-testid="user-filter">{logs.userFilter || "no-filter"}</div>
      <div data-testid="show-only-mine">
        {logs.showOnlyMine ? "true" : "false"}
      </div>
      <div data-testid="current-user">{logs.currentUserName}</div>
      <div data-testid="user-id">{logs.userId || "no-user-id"}</div>
      <button
        onClick={() => logs.setTagFilter("guitar")}
        data-testid="set-tag-btn"
      >
        Set Tag Filter
      </button>
      <button
        onClick={() => logs.setUserFilter("Test")}
        data-testid="set-user-btn"
      >
        Set User Filter
      </button>
      <button
        onClick={() => logs.setShowOnlyMine(true)}
        data-testid="set-mine-btn"
      >
        Show Only Mine
      </button>
      <button onClick={logs.clearFilters} data-testid="clear-filters-btn">
        Clear Filters
      </button>
      <button
        onClick={() => logs.addLog(mockLogs[0])}
        data-testid="add-log-btn"
      >
        Add Log
      </button>
      <button onClick={logs.loadMoreLogs} data-testid="load-more-btn">
        Load More
      </button>
      <button onClick={logs.refreshLogs} data-testid="refresh-btn">
        Refresh
      </button>
    </div>
  );
};

describe("LogsContext", () => {
  let unsubscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();
    mockSubscribeToFriendsLogs.mockReturnValue(unsubscribeMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("LogsContextProvider", () => {
    it("renders children correctly", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <div data-testid="child">Child Content</div>
        </LogsContextProvider>
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });

    it("initializes with correct default state", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      expect(screen.getByTestId("logs-count")).toHaveTextContent("0");
      expect(screen.getByTestId("all-logs-count")).toHaveTextContent("0");
      expect(screen.getByTestId("has-more")).toHaveTextContent("no-more");
      expect(screen.getByTestId("page")).toHaveTextContent("1");
      expect(screen.getByTestId("tag-filter")).toHaveTextContent("no-filter");
      expect(screen.getByTestId("user-filter")).toHaveTextContent("no-filter");
      expect(screen.getByTestId("show-only-mine")).toHaveTextContent("false");
      expect(screen.getByTestId("current-user")).toHaveTextContent("Test User");
      expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
    });
  });

  describe("setTagFilter", () => {
    it("sets tag filter correctly", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      fireEvent.click(screen.getByTestId("set-tag-btn"));
      expect(screen.getByTestId("tag-filter")).toHaveTextContent("guitar");
    });
  });

  describe("setUserFilter", () => {
    it("sets user filter correctly", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      fireEvent.click(screen.getByTestId("set-user-btn"));
      expect(screen.getByTestId("user-filter")).toHaveTextContent("Test");
    });
  });

  describe("setShowOnlyMine", () => {
    it("sets show only mine filter correctly", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      fireEvent.click(screen.getByTestId("set-mine-btn"));
      expect(screen.getByTestId("show-only-mine")).toHaveTextContent("true");
    });
  });

  describe("clearFilters", () => {
    it("clears all filters", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Set filters first
      fireEvent.click(screen.getByTestId("set-tag-btn"));
      fireEvent.click(screen.getByTestId("set-user-btn"));
      fireEvent.click(screen.getByTestId("set-mine-btn"));

      expect(screen.getByTestId("tag-filter")).toHaveTextContent("guitar");
      expect(screen.getByTestId("user-filter")).toHaveTextContent("Test");
      expect(screen.getByTestId("show-only-mine")).toHaveTextContent("true");

      // Clear filters
      fireEvent.click(screen.getByTestId("clear-filters-btn"));

      expect(screen.getByTestId("tag-filter")).toHaveTextContent("no-filter");
      expect(screen.getByTestId("user-filter")).toHaveTextContent("no-filter");
      expect(screen.getByTestId("show-only-mine")).toHaveTextContent("false");
    });
  });

  describe("addLog", () => {
    it("adds a log to the beginning of allLogs", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      fireEvent.click(screen.getByTestId("add-log-btn"));
      expect(screen.getByTestId("all-logs-count")).toHaveTextContent("1");
    });
  });

  describe("loadMoreLogs", () => {
    it("increments page when loading more", async () => {
      let successCallback: ((logs: OrganizedLogEntry[]) => void) | null = null;

      mockSubscribeToFriendsLogs.mockImplementation(
        (_userId: string, onSuccess: (logs: OrganizedLogEntry[]) => void) => {
          successCallback = onSuccess;
          return unsubscribeMock;
        }
      );

      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      // First load some logs to set hasMore to true (more than page size of 10)
      const manyLogs = Array.from({ length: 15 }, (_, i) => ({
        user: "Test User",
        duration: "30",
        createdAt: `2024-01-${String(i + 1).padStart(2, "0")}T15:00:00.000Z`,
        description: `Practice session ${i}`,
        tags: ["guitar"],
      }));

      act(() => {
        if (successCallback) {
          successCallback(manyLogs);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("has-more")).toHaveTextContent("has-more");
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("load-more-btn"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("page")).toHaveTextContent("2");
      });
    });

    it("does not load more when hasMore is false", async () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Page should stay at 1 since hasMore is false
      await act(async () => {
        fireEvent.click(screen.getByTestId("load-more-btn"));
      });

      expect(screen.getByTestId("page")).toHaveTextContent("1");
      expect(screen.getByTestId("has-more")).toHaveTextContent("no-more");
    });
  });

  describe("refreshLogs", () => {
    it("sets loading state when refreshing", async () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId("refresh-btn"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      });
    });
  });

  describe("useLogs hook", () => {
    it("throws error when used outside of LogsContextProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const InvalidComponent = () => {
        try {
          useLogs();
          return <div>No error thrown</div>;
        } catch {
          return <div>Error caught</div>;
        }
      };

      render(<InvalidComponent />);

      expect(screen.getByText("Error caught")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("returns context value when used within LogsContextProvider", () => {
      render(
        <LogsContextProvider enableRealtime={false}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Should render without throwing
      expect(screen.getByTestId("logs-count")).toBeInTheDocument();
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
  });

  describe("real-time subscription", () => {
    it("sets up subscription when realtime is enabled and user exists", () => {
      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      expect(mockSubscribeToFriendsLogs).toHaveBeenCalledWith(
        "test-user-id",
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("cleans up subscription on unmount", () => {
      const { unmount } = render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      unmount();
      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it("updates logs when subscription receives data", async () => {
      let successCallback: ((logs: OrganizedLogEntry[]) => void) | null = null;

      mockSubscribeToFriendsLogs.mockImplementation(
        (_userId: string, onSuccess: (logs: OrganizedLogEntry[]) => void) => {
          successCallback = onSuccess;
          return unsubscribeMock;
        }
      );

      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Simulate receiving logs from subscription
      act(() => {
        if (successCallback) {
          successCallback(mockLogs);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("all-logs-count")).toHaveTextContent("3");
      });

      expect(screen.getByTestId("has-more")).toHaveTextContent("no-more");
    });

    it("handles subscription errors", async () => {
      let errorCallback: ((error: Error) => void) | null = null;

      mockSubscribeToFriendsLogs.mockImplementation(
        (
          _userId: string,
          _onSuccess: unknown,
          onError: (error: Error) => void
        ) => {
          errorCallback = onError;
          return unsubscribeMock;
        }
      );

      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Simulate subscription error
      act(() => {
        if (errorCallback) {
          errorCallback(new Error("Subscription failed"));
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Subscription failed"
        );
      });

      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });
  });

  describe("filtering", () => {
    it("filters logs by tag correctly", async () => {
      let successCallback: ((logs: OrganizedLogEntry[]) => void) | null = null;

      mockSubscribeToFriendsLogs.mockImplementation(
        (_userId: string, onSuccess: (logs: OrganizedLogEntry[]) => void) => {
          successCallback = onSuccess;
          return unsubscribeMock;
        }
      );

      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Load logs first
      act(() => {
        if (successCallback) {
          successCallback(mockLogs);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("all-logs-count")).toHaveTextContent("3");
      });

      // Apply tag filter
      fireEvent.click(screen.getByTestId("set-tag-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("logs-count")).toHaveTextContent("2"); // Only guitar logs
      });
    });

    it("filters logs by user correctly", async () => {
      let successCallback: ((logs: OrganizedLogEntry[]) => void) | null = null;

      mockSubscribeToFriendsLogs.mockImplementation(
        (_userId: string, onSuccess: (logs: OrganizedLogEntry[]) => void) => {
          successCallback = onSuccess;
          return unsubscribeMock;
        }
      );

      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Load logs first
      act(() => {
        if (successCallback) {
          successCallback(mockLogs);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("all-logs-count")).toHaveTextContent("3");
      });

      // Apply user filter
      fireEvent.click(screen.getByTestId("set-user-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("logs-count")).toHaveTextContent("2"); // Only Test User logs
      });
    });

    it("filters logs by show only mine correctly", async () => {
      let successCallback: ((logs: OrganizedLogEntry[]) => void) | null = null;

      mockSubscribeToFriendsLogs.mockImplementation(
        (_userId: string, onSuccess: (logs: OrganizedLogEntry[]) => void) => {
          successCallback = onSuccess;
          return unsubscribeMock;
        }
      );

      render(
        <LogsContextProvider enableRealtime={true}>
          <TestComponent />
        </LogsContextProvider>
      );

      // Load logs first
      act(() => {
        if (successCallback) {
          successCallback(mockLogs);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("all-logs-count")).toHaveTextContent("3");
      });

      // Apply show only mine filter
      fireEvent.click(screen.getByTestId("set-mine-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("logs-count")).toHaveTextContent("2"); // Only current user logs
      });
    });
  });
});

// Import fireEvent
import { fireEvent } from "@testing-library/react";
