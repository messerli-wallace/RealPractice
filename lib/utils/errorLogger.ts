/**
 * Centralized error logging system for RealPractice application
 * Provides structured error logging with context and severity levels
 */

import { User } from "../../types";

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

// In-memory log buffer for development
const logBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER_SIZE = 100;

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
  if (logBuffer.length > MAX_LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Log to console based on severity
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
 * Clear the log buffer
 */
export function clearLogBuffer(): void {
  logBuffer.length = 0;
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
