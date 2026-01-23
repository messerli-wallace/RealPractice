/**
 * Centralized error logging system for RealPractice application
 * Provides structured error logging with context and severity levels
 */

import { User } from "../../types/index";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface ErrorContext {
  component?: string;
  function?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context: ErrorContext;
}

// Configuration interface for error logging
export interface ErrorLoggerConfig {
  maxLogBufferSize?: number;
  enableConsoleLogging?: boolean;
  enableLocalStoragePersistence?: boolean;
  externalLoggingService?: {
    name: string;
    apiKey?: string;
    endpoint?: string;
  };
}

// Default configuration
const defaultConfig: ErrorLoggerConfig = {
  maxLogBufferSize: 100,
  enableConsoleLogging: true,
  enableLocalStoragePersistence: false,
};

// In-memory log buffer for development
const logBuffer: LogEntry[] = [];
let currentConfig: ErrorLoggerConfig = defaultConfig;

/**
 * Configure the error logger
 */
export function configureErrorLogger(config: Partial<ErrorLoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };

  // Apply max log buffer size immediately
  if (
    currentConfig.maxLogBufferSize &&
    logBuffer.length > currentConfig.maxLogBufferSize
  ) {
    logBuffer.splice(0, logBuffer.length - currentConfig.maxLogBufferSize);
  }
}

// Initialize from localStorage if enabled
if (
  typeof window !== "undefined" &&
  defaultConfig.enableLocalStoragePersistence
) {
  try {
    const savedLogs = localStorage.getItem("realPracticeErrorLogs");
    if (savedLogs) {
      const parsedLogs: LogEntry[] = JSON.parse(savedLogs);
      logBuffer.push(...parsedLogs);
    }
  } catch (error) {
    console.warn("Failed to load logs from localStorage:", error);
  }
}

/**
 * Log an error with context information
 */
export function logError(
  message: string,
  error: Error,
  context: Partial<ErrorContext> = {}
): void {
  const logEntry: LogEntry = {
    level: LogLevel.ERROR,
    message,
    error,
    context: {
      timestamp: new Date(),
      ...context,
    },
  };

  processLogEntry(logEntry);
}

/**
 * Log a warning with context information
 */
export function logWarning(
  message: string,
  context: Partial<ErrorContext> = {}
): void {
  const logEntry: LogEntry = {
    level: LogLevel.WARN,
    message,
    context: {
      timestamp: new Date(),
      ...context,
    },
  };

  processLogEntry(logEntry);
}

/**
 * Log informational message with context
 */
export function logInfo(
  message: string,
  context: Partial<ErrorContext> = {}
): void {
  const logEntry: LogEntry = {
    level: LogLevel.INFO,
    message,
    context: {
      timestamp: new Date(),
      ...context,
    },
  };

  processLogEntry(logEntry);
}

/**
 * Process and store log entries
 */
function processLogEntry(entry: LogEntry): void {
  // Add to buffer
  logBuffer.push(entry);

  // Trim buffer if it exceeds max size
  if (logBuffer.length > currentConfig.maxLogBufferSize!) {
    logBuffer.shift();
  }

  // Persist to localStorage if enabled
  if (
    currentConfig.enableLocalStoragePersistence &&
    typeof window !== "undefined"
  ) {
    try {
      localStorage.setItem("realPracticeErrorLogs", JSON.stringify(logBuffer));
    } catch (error) {
      console.warn("Failed to save logs to localStorage:", error);
    }
  }

  // Log to console if enabled
  if (currentConfig.enableConsoleLogging) {
    const consoleMethod = getConsoleMethodForLevel(entry.level);

    consoleMethod(`[${entry.level}] ${entry.message}`);

    if (entry.error) {
      console.error("Error details:", entry.error);
    }

    if (entry.context) {
      console.log("Context:", {
        ...entry.context,
        timestamp: entry.context.timestamp.toISOString(),
      });
    }
  }

  // Send to external logging service if configured
  if (currentConfig.externalLoggingService) {
    sendToExternalService(entry);
  }
}

/**
 * Send log entry to external logging service
 */
async function sendToExternalService(entry: LogEntry): Promise<void> {
  try {
    const service = currentConfig.externalLoggingService;

    if (!service || !service.endpoint) {
      return;
    }

    // Prepare log data for external service
    const logData = {
      level: entry.level,
      message: entry.message,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        : undefined,
      context: entry.context,
      timestamp: new Date().toISOString(),
      application: "RealPractice",
    };

    // Send to external service
    const response = await fetch(service.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(service.apiKey
          ? { Authorization: `Bearer ${service.apiKey}` }
          : {}),
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      console.warn(
        `Failed to send log to ${service.name}:`,
        response.statusText
      );
    }
  } catch (error) {
    console.warn("Failed to send log to external service:", error);
  }
}

/**
 * Get appropriate console method for log level
 */
function getConsoleMethodForLevel(
  level: LogLevel
): (...args: unknown[]) => void {
  switch (level) {
    case LogLevel.CRITICAL:
    case LogLevel.ERROR:
      return console.error;
    case LogLevel.WARN:
      return console.warn;
    case LogLevel.INFO:
    default:
      return console.log;
  }
}

/**
 * Get all logged errors (for debugging/development)
 */
export function getLogBuffer(): LogEntry[] {
  return [...logBuffer];
}

/**
 * Get logs filtered by criteria
 */
export function getFilteredLogs(criteria: {
  level?: LogLevel | LogLevel[];
  component?: string;
  minTimestamp?: Date;
  maxTimestamp?: Date;
  searchText?: string;
}): LogEntry[] {
  return logBuffer.filter((entry) => {
    // Filter by level
    if (criteria.level) {
      const levels = Array.isArray(criteria.level)
        ? criteria.level
        : [criteria.level];
      if (!levels.includes(entry.level)) {
        return false;
      }
    }

    // Filter by component
    if (criteria.component && entry.context.component !== criteria.component) {
      return false;
    }

    // Filter by timestamp range
    if (
      criteria.minTimestamp &&
      entry.context.timestamp < criteria.minTimestamp
    ) {
      return false;
    }

    if (
      criteria.maxTimestamp &&
      entry.context.timestamp > criteria.maxTimestamp
    ) {
      return false;
    }

    // Filter by search text
    if (criteria.searchText) {
      const searchLower = criteria.searchText.toLowerCase();
      const messageMatch = entry.message.toLowerCase().includes(searchLower);
      const errorMatch = entry.error?.message
        .toLowerCase()
        .includes(searchLower);
      const contextMatch = JSON.stringify(entry.context)
        .toLowerCase()
        .includes(searchLower);

      if (!messageMatch && !errorMatch && !contextMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Export logs as JSON string
 */
export function exportLogsAsJson(): string {
  return JSON.stringify(logBuffer, null, 2);
}

/**
 * Export logs as CSV string
 */
export function exportLogsAsCsv(): string {
  const headers = [
    "Timestamp",
    "Level",
    "Message",
    "Error",
    "Component",
    "Function",
    "User ID",
  ];

  const rows = logBuffer.map((entry) => {
    const errorMessage = entry.error
      ? `"${entry.error.message.replace('"', "'")}"`
      : "";
    return [
      entry.context.timestamp.toISOString(),
      entry.level,
      `"${entry.message.replace('"', "'")}"`,
      errorMessage,
      entry.context.component || "",
      entry.context.function || "",
      entry.context.userId || "",
    ];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

/**
 * Clear the log buffer
 */
export function clearLogBuffer(): void {
  logBuffer.length = 0;

  // Also clear from localStorage if enabled
  if (
    currentConfig.enableLocalStoragePersistence &&
    typeof window !== "undefined"
  ) {
    try {
      localStorage.removeItem("realPracticeErrorLogs");
    } catch (error) {
      console.warn("Failed to clear logs from localStorage:", error);
    }
  }
}

/**
 * Create a context builder for a specific component
 */
export function createComponentContext(componentName: string): {
  withUser: (user: User | null) => ErrorContext;
  withFunction: (functionName: string) => ErrorContext;
} {
  return {
    withUser: (user: User | null) => ({
      component: componentName,
      userId: user?.uid || "anonymous",
      timestamp: new Date(),
    }),
    withFunction: (functionName: string) => ({
      component: componentName,
      function: functionName,
      timestamp: new Date(),
    }),
  };
}

/**
 * Enhanced error logging with automatic context capture
 */
export function withErrorLogging<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: Partial<ErrorContext> = {}
): (...args: Parameters<T>) => ReturnType<T> {
  return async function (...args: Parameters<T>) {
    try {
      return await fn(...args);
    } catch (error) {
      const errorContext: ErrorContext = {
        timestamp: new Date(),
        ...context,
      };

      if (error instanceof Error) {
        logError(`Function failed: ${fn.name}`, error, errorContext);
      } else {
        logError(
          `Function failed: ${fn.name}`,
          new Error(String(error)),
          errorContext
        );
      }

      throw error;
    }
  } as (...args: Parameters<T>) => ReturnType<T>;
}

/**
 * Log critical errors that require immediate attention
 */
export function logCriticalError(
  message: string,
  error: Error,
  context: Partial<ErrorContext> = {}
): void {
  const logEntry: LogEntry = {
    level: LogLevel.CRITICAL,
    message,
    error,
    context: {
      timestamp: new Date(),
      ...context,
    },
  };

  // Critical errors get special handling
  console.error(`🚨 CRITICAL ERROR: ${message}`);
  console.error("Error:", error);
  console.error("Context:", logEntry.context);

  processLogEntry(logEntry);
}
