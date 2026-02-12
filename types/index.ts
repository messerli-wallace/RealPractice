/**
 * Centralized TypeScript types and interfaces for RealPractice application
 */
import { logError } from "../lib/utils/errorLogger";

/**
 * User data structure
 */
export interface UserData {
  name?: string | null;
  email?: string | null;
  logs?: LogItem[];
  friends?: string[];
  bio?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  tagAnalytics?: Record<string, number>;
}

/**
 * Log item structure
 */
export interface LogItem {
  id?: string;
  userId?: string;
  duration: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  location?: string;
  mood?: string;
  visibility?: "public" | "friends" | "private";
}

/**
 * Log entry structure (similar to LogItem but with null description)
 */
export interface LogEntry {
  duration: string;
  tags: string[];
  description: string | null;
  createdAt: string;
  updatedAt?: string;
  location?: string;
  mood?: string;
  visibility?: "public" | "friends" | "private";
}

/**
 * User log data structure - maps user IDs to their log entries
 */
export interface UserLogData {
  [userId: string]: LogEntry[];
}

/**
 * Organized log entry with user information
 */
export interface OrganizedLogEntry {
  user: string;
  userId: string;
  createdAt: string;
  duration: string;
  tags: string[];
  description: string | null;
}

/**
 * Search result item with specific properties
 */
export interface SearchResultItem {
  id: string;
  name: string;
  type: "user" | "log";
  description?: string;
  tags?: string[];
  userId?: string;
}

/**
 * Search result type
 */
export interface SearchResult {
  users: SearchResultItem[];
  logs: SearchResultItem[];
}

/**
 * Firebase user interface
 */
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  providerData: Array<{
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }>;
}

/**
 * Error metadata interface
 */
export interface ErrorMetadata {
  [key: string]: unknown;
  docPath?: string;
  retryCount?: number;
  userId?: string;
  component?: string;
  function?: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  valid: boolean;
  error?: string;
  sanitized: T;
}

/**
 * Log entry validation result
 */
export interface LogValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    dateTimeStr: string;
    duration: string;
    description: string;
    tags: string[];
  };
}

/**
 * Type Guards
 */
export function isUserData(obj: unknown): obj is UserData {
  if (typeof obj !== "object" || obj === null) return false;
  const userData = obj as UserData;
  return (
    (userData.name === undefined ||
      typeof userData.name === "string" ||
      userData.name === null) &&
    (userData.logs === undefined || Array.isArray(userData.logs)) &&
    (userData.friends === undefined || Array.isArray(userData.friends)) &&
    (userData.bio === undefined || typeof userData.bio === "string") &&
    (userData.profilePicture === undefined ||
      typeof userData.profilePicture === "string") &&
    (userData.createdAt === undefined ||
      typeof userData.createdAt === "string") &&
    (userData.updatedAt === undefined ||
      typeof userData.updatedAt === "string") &&
    (userData.tagAnalytics === undefined ||
      typeof userData.tagAnalytics === "object") &&
    (userData.tagAnalytics === undefined ||
      userData.tagAnalytics === null ||
      typeof userData.tagAnalytics === "object")
  );
}

export function isLogItem(obj: unknown): obj is LogItem {
  if (typeof obj !== "object" || obj === null) return false;
  const logItem = obj as LogItem;
  return (
    typeof logItem.createdAt === "string" &&
    typeof logItem.duration === "string" &&
    typeof logItem.description === "string" &&
    Array.isArray(logItem.tags) &&
    (logItem.updatedAt === undefined ||
      typeof logItem.updatedAt === "string") &&
    (logItem.location === undefined || typeof logItem.location === "string") &&
    (logItem.mood === undefined || typeof logItem.mood === "string") &&
    (logItem.visibility === undefined ||
      ["public", "friends", "private"].includes(logItem.visibility))
  );
}

export function isLogEntry(obj: unknown): obj is LogEntry {
  if (typeof obj !== "object" || obj === null) return false;
  const logEntry = obj as LogEntry;
  return (
    typeof logEntry.createdAt === "string" &&
    typeof logEntry.duration === "string" &&
    Array.isArray(logEntry.tags) &&
    (logEntry.description === null ||
      typeof logEntry.description === "string") &&
    (logEntry.updatedAt === undefined ||
      typeof logEntry.updatedAt === "string") &&
    (logEntry.location === undefined ||
      typeof logEntry.location === "string") &&
    (logEntry.mood === undefined || typeof logEntry.mood === "string") &&
    (logEntry.visibility === undefined ||
      ["public", "friends", "private"].includes(logEntry.visibility))
  );
}

export function isSearchResultItem(obj: unknown): obj is SearchResultItem {
  if (typeof obj !== "object" || obj === null) return false;
  const item = obj as SearchResultItem;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    (item.type === "user" || item.type === "log") &&
    (item.description === undefined || typeof item.description === "string") &&
    (item.tags === undefined || Array.isArray(item.tags))
  );
}

export function isSearchResult(obj: unknown): obj is SearchResult {
  if (typeof obj !== "object" || obj === null) return false;
  const result = obj as SearchResult;
  return (
    Array.isArray(result.users) &&
    Array.isArray(result.logs) &&
    result.users.every(isSearchResultItem) &&
    result.logs.every(isSearchResultItem)
  );
}

export function isUser(obj: unknown): obj is User {
  if (typeof obj !== "object" || obj === null) return false;
  const user = obj as User;
  return (
    typeof user.uid === "string" &&
    (user.displayName === null || typeof user.displayName === "string") &&
    (user.email === null || typeof user.email === "string")
  );
}

export function isErrorMetadata(obj: unknown): obj is ErrorMetadata {
  if (typeof obj !== "object" || obj === null) return false;
  const metadata = obj as ErrorMetadata;
  return Object.keys(metadata).every(
    (key) =>
      key === "docPath" ||
      key === "retryCount" ||
      key === "userId" ||
      key === "component" ||
      key === "function"
  );
}

/**
 * Runtime validation functions
 */
export function validateUserData(data: unknown): UserData | null {
  if (isUserData(data)) {
    return data;
  }
  logError("Invalid UserData", new Error("Data validation failed"), {
    component: "types",
    function: "validateUserData",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}

export function validateLogItem(data: unknown): LogItem | null {
  if (isLogItem(data)) {
    return data;
  }
  logError("Invalid LogItem", new Error("Data validation failed"), {
    component: "types",
    function: "validateLogItem",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}

export function validateLogEntry(data: unknown): LogEntry | null {
  if (isLogEntry(data)) {
    return data;
  }
  logError("Invalid LogEntry", new Error("Data validation failed"), {
    component: "types",
    function: "validateLogEntry",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}

export function validateSearchResultItem(
  data: unknown
): SearchResultItem | null {
  if (isSearchResultItem(data)) {
    return data;
  }
  logError("Invalid SearchResultItem", new Error("Data validation failed"), {
    component: "types",
    function: "validateSearchResultItem",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}

export function validateSearchResult(data: unknown): SearchResult | null {
  if (isSearchResult(data)) {
    return data;
  }
  logError("Invalid SearchResult", new Error("Data validation failed"), {
    component: "types",
    function: "validateSearchResult",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}

export function validateUser(data: unknown): User | null {
  if (isUser(data)) {
    return data;
  }
  logError("Invalid User", new Error("Data validation failed"), {
    component: "types",
    function: "validateUser",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}

export function validateErrorMetadata(data: unknown): ErrorMetadata | null {
  if (isErrorMetadata(data)) {
    return data;
  }
  logError("Invalid ErrorMetadata", new Error("Data validation failed"), {
    component: "types",
    function: "validateErrorMetadata",
    metadata: { data: JSON.stringify(data) },
  });
  return null;
}
