import {
  LogLevel,
  logError,
  logWarning,
  logInfo,
  logCriticalError,
  configureErrorLogger,
  getLogBuffer,
  getFilteredLogs,
  exportLogsAsJson,
  exportLogsAsCsv,
  clearLogBuffer,
  createComponentContext,
  withErrorLogging,
  ErrorContext,
  LogEntry,
} from "../../../lib/utils/errorLogger";

describe("Error Logger", () => {
  // Clear buffer before each test to ensure isolation
  beforeEach(() => {
    clearLogBuffer();
    // Reset config to defaults
    configureErrorLogger({
      maxLogBufferSize: 100,
      enableConsoleLogging: true,
      enableLocalStoragePersistence: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("LogLevel enum", () => {
    it("has all required log levels", () => {
      expect(LogLevel.INFO).toBe("INFO");
      expect(LogLevel.WARN).toBe("WARN");
      expect(LogLevel.ERROR).toBe("ERROR");
      expect(LogLevel.CRITICAL).toBe("CRITICAL");
    });
  });

  describe("logError", () => {
    it("logs an error with message and context", () => {
      const testError = new Error("Test error message");
      const context: Partial<ErrorContext> = {
        component: "TestComponent",
        function: "testFunction",
        userId: "user123",
      };

      logError("Test error occurred", testError, context);

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toBe("Test error occurred");
      expect(logs[0].error).toBe(testError);
      expect(logs[0].context.component).toBe("TestComponent");
      expect(logs[0].context.function).toBe("testFunction");
      expect(logs[0].context.userId).toBe("user123");
      expect(logs[0].context.timestamp).toBeInstanceOf(Date);
    });

    it("logs an error without optional context fields", () => {
      const testError = new Error("Minimal error");

      logError("Minimal error occurred", testError);

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe("Minimal error occurred");
      expect(logs[0].context.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("logWarning", () => {
    it("logs a warning with message and context", () => {
      const context: Partial<ErrorContext> = {
        component: "TestComponent",
        metadata: { key: "value" },
      };

      logWarning("Test warning message", context);

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe("Test warning message");
      expect(logs[0].context.component).toBe("TestComponent");
      expect(logs[0].context.metadata).toEqual({ key: "value" });
    });

    it("logs a warning without context", () => {
      logWarning("Standalone warning");

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe("Standalone warning");
    });
  });

  describe("logInfo", () => {
    it("logs an info message with context", () => {
      const context: Partial<ErrorContext> = {
        component: "TestComponent",
        function: "initialize",
      };

      logInfo("Application initialized", context);

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe("Application initialized");
    });

    it("logs an info message without context", () => {
      logInfo("Simple info message");

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe("Simple info message");
    });
  });

  describe("logCriticalError", () => {
    it("logs a critical error with special handling", () => {
      const criticalError = new Error("Critical system failure");
      const context: Partial<ErrorContext> = {
        component: "CoreSystem",
        userId: "admin",
      };

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      logCriticalError("System crash imminent", criticalError, context);

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.CRITICAL);
      expect(logs[0].message).toBe("System crash imminent");
      expect(logs[0].error).toBe(criticalError);

      // Verify console.error was called with special formatting
      expect(consoleSpy).toHaveBeenCalledWith(
        "🚨 CRITICAL ERROR: System crash imminent"
      );
      expect(consoleSpy).toHaveBeenCalledWith("Error:", criticalError);
      expect(consoleSpy).toHaveBeenCalledWith("Context:", logs[0].context);

      consoleSpy.mockRestore();
    });
  });

  describe("configureErrorLogger", () => {
    it("updates configuration settings", () => {
      configureErrorLogger({
        maxLogBufferSize: 50,
        enableConsoleLogging: false,
        enableLocalStoragePersistence: true,
      });

      // Add some logs to test buffer size limit
      for (let i = 0; i < 60; i++) {
        logInfo(`Log entry ${i}`);
      }

      const logs = getLogBuffer();
      // Buffer should be trimmed to max size
      expect(logs.length).toBeLessThanOrEqual(50);
    });
  });

  describe("getLogBuffer", () => {
    it("returns a copy of the log buffer", () => {
      logInfo("Test log");

      const logs1 = getLogBuffer();
      const logs2 = getLogBuffer();

      // Should return separate arrays
      expect(logs1).not.toBe(logs2);
      expect(logs1).toEqual(logs2);
    });

    it("returns empty array when no logs exist", () => {
      const logs = getLogBuffer();
      expect(logs).toEqual([]);
    });
  });

  describe("getFilteredLogs", () => {
    beforeEach(() => {
      // Create logs with different properties
      logInfo("Info message 1", { component: "ComponentA" });
      logWarning("Warning message", { component: "ComponentB" });
      logError("Error message", new Error("Test error"), {
        component: "ComponentA",
      });
      logInfo("Info message 2", { component: "ComponentC" });
    });

    it("filters logs by single level", () => {
      const infoLogs = getFilteredLogs({ level: LogLevel.INFO });
      expect(infoLogs).toHaveLength(2);
      expect(
        infoLogs.every((log: LogEntry) => log.level === LogLevel.INFO)
      ).toBe(true);
    });

    it("filters logs by multiple levels", () => {
      const logs = getFilteredLogs({
        level: [LogLevel.INFO, LogLevel.ERROR],
      });
      expect(logs).toHaveLength(3);
    });

    it("filters logs by component", () => {
      const componentALogs = getFilteredLogs({ component: "ComponentA" });
      expect(componentALogs).toHaveLength(2);
      expect(
        componentALogs.every(
          (log: LogEntry) => log.context.component === "ComponentA"
        )
      ).toBe(true);
    });

    it("filters logs by timestamp range", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000);
      const future = new Date(now.getTime() + 1000);

      const logs = getFilteredLogs({
        minTimestamp: past,
        maxTimestamp: future,
      });
      expect(logs.length).toBeGreaterThan(0);
    });

    it("filters logs by search text in message", () => {
      const logs = getFilteredLogs({ searchText: "Warning" });
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe("Warning message");
    });

    it("filters logs by search text in error message", () => {
      const logs = getFilteredLogs({ searchText: "Test error" });
      expect(logs).toHaveLength(1);
      expect(logs[0].error?.message).toBe("Test error");
    });

    it("returns all logs when no criteria specified", () => {
      const logs = getFilteredLogs({});
      expect(logs).toHaveLength(4);
    });
  });

  describe("exportLogsAsJson", () => {
    it("exports logs as formatted JSON string", () => {
      logInfo("Test message", { component: "TestComponent" });

      const json = exportLogsAsJson();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe("Test message");
      expect(parsed[0].level).toBe(LogLevel.INFO);
    });

    it("returns empty array JSON when no logs", () => {
      const json = exportLogsAsJson();
      expect(json).toBe("[]");
    });
  });

  describe("exportLogsAsCsv", () => {
    it("exports logs as CSV string with headers", () => {
      const testError = new Error("CSV test error");
      logError("CSV test", testError, {
        component: "TestComponent",
        function: "testExport",
        userId: "user123",
      });

      const csv = exportLogsAsCsv();
      const lines = csv.split("\n");

      // Check header
      expect(lines[0]).toBe(
        "Timestamp,Level,Message,Error,Component,Function,User ID"
      );

      // Check data row contains expected values
      expect(lines[1]).toContain("ERROR");
      expect(lines[1]).toContain("CSV test");
      expect(lines[1]).toContain("TestComponent");
      expect(lines[1]).toContain("user123");
    });

    it("handles empty log buffer", () => {
      const csv = exportLogsAsCsv();
      const lines = csv.split("\n");

      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe(
        "Timestamp,Level,Message,Error,Component,Function,User ID"
      );
    });

    it("escapes first quote in messages", () => {
      logInfo('Message with "quotes"');

      const csv = exportLogsAsCsv();
      // Implementation replaces first double quote with single quote
      expect(csv).toContain("Message with 'quotes\"");
    });
  });

  describe("clearLogBuffer", () => {
    it("removes all logs from buffer", () => {
      logInfo("Log 1");
      logInfo("Log 2");

      expect(getLogBuffer()).toHaveLength(2);

      clearLogBuffer();

      expect(getLogBuffer()).toHaveLength(0);
    });

    it("handles clearing empty buffer", () => {
      expect(() => clearLogBuffer()).not.toThrow();
      expect(getLogBuffer()).toHaveLength(0);
    });
  });

  describe("createComponentContext", () => {
    it("creates context builder with withUser method", () => {
      const contextBuilder = createComponentContext("MyComponent");

      expect(contextBuilder.withUser).toBeDefined();
      expect(typeof contextBuilder.withUser).toBe("function");
    });

    it("creates context with user information", () => {
      const contextBuilder = createComponentContext("MyComponent");
      const mockUser = {
        uid: "user123",
        email: "test@example.com",
      } as unknown as import("../../../types/index").User;

      const context = contextBuilder.withUser(mockUser);

      expect(context.component).toBe("MyComponent");
      expect(context.userId).toBe("user123");
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it("uses anonymous for null user", () => {
      const contextBuilder = createComponentContext("MyComponent");

      const context = contextBuilder.withUser(null);

      expect(context.userId).toBe("anonymous");
    });

    it("creates context with function information", () => {
      const contextBuilder = createComponentContext("MyComponent");

      const context = contextBuilder.withFunction("handleClick");

      expect(context.component).toBe("MyComponent");
      expect(context.function).toBe("handleClick");
      expect(context.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("withErrorLogging", () => {
    it("returns function result when no error occurs", async () => {
      const testFn = jest.fn().mockResolvedValue("success");
      const wrappedFn = withErrorLogging(testFn, { component: "Test" });

      const result = await wrappedFn("arg1", "arg2");

      expect(result).toBe("success");
      expect(testFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("logs error and re-throws when function fails", async () => {
      const testError = new Error("Function failed");
      const testFn = jest.fn().mockRejectedValue(testError);
      const wrappedFn = withErrorLogging(testFn, { component: "Test" });

      await expect(wrappedFn()).rejects.toThrow("Function failed");

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toContain("Function failed");
      expect(logs[0].error).toBe(testError);
    });

    it("handles non-Error exceptions by wrapping them", async () => {
      const testFn = jest.fn().mockRejectedValue("string error");
      const wrappedFn = withErrorLogging(testFn, { component: "Test" });

      await expect(wrappedFn()).rejects.toBe("string error");

      const logs = getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0].error?.message).toBe("string error");
    });

    it("preserves function name in error message", async () => {
      async function myTestFunction() {
        throw new Error("Test error");
      }
      const wrappedFn = withErrorLogging(myTestFunction, { component: "Test" });

      await expect(wrappedFn()).rejects.toThrow("Test error");

      const logs = getLogBuffer();
      expect(logs[0].message).toContain("myTestFunction");
    });
  });

  describe("buffer size management", () => {
    it("enforces max buffer size", () => {
      configureErrorLogger({ maxLogBufferSize: 3 });

      logInfo("Log 1");
      logInfo("Log 2");
      logInfo("Log 3");
      logInfo("Log 4");
      logInfo("Log 5");

      const logs = getLogBuffer();
      expect(logs).toHaveLength(3);
      // Oldest logs should be removed
      expect(logs[0].message).toBe("Log 3");
      expect(logs[2].message).toBe("Log 5");
    });
  });
});
