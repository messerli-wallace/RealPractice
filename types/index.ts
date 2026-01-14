/**
 * Centralized TypeScript types and interfaces for RealPractice application
 */

/**
 * User data structure
 */
export interface UserData {
  name?: string | null;
  logs?: LogItem[];
  friends?: string[];
  bio?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Log item structure
 */
export interface LogItem {
  dateTimeStr: string;
  duration: string;
  description: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  location?: string;
  mood?: string;
  visibility?: "public" | "friends" | "private";
}

/**
 * Log entry structure (similar to LogItem but with null description)
 */
export interface LogEntry {
  dateTimeStr: string;
  duration: string;
  tags: string[];
  description: string | null;
  createdAt?: string;
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
  dateTimeStr: string;
  duration: string;
  tags: string[];
  description: string | null;
}

/**
 * Search result item - maps user IDs to user data
 */
export interface SearchResultItem {
  [userId: string]: UserData;
}

/**
 * Search result type
 */
export type SearchResult = SearchResultItem[];

/**
 * Firebase user interface
 */
export interface User {
  uid: string;
  displayName: string | null;
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
    (userData.updatedAt === undefined || typeof userData.updatedAt === "string")
  );
}

export function isLogItem(obj: unknown): obj is LogItem {
  if (typeof obj !== "object" || obj === null) return false;
  const logItem = obj as LogItem;
  return (
    typeof logItem.dateTimeStr === "string" &&
    typeof logItem.duration === "string" &&
    typeof logItem.description === "string" &&
    Array.isArray(logItem.tags) &&
    (logItem.createdAt === undefined ||
      typeof logItem.createdAt === "string") &&
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
    typeof logEntry.dateTimeStr === "string" &&
    typeof logEntry.duration === "string" &&
    Array.isArray(logEntry.tags) &&
    (logEntry.description === null ||
      typeof logEntry.description === "string") &&
    (logEntry.createdAt === undefined ||
      typeof logEntry.createdAt === "string") &&
    (logEntry.updatedAt === undefined ||
      typeof logEntry.updatedAt === "string") &&
    (logEntry.location === undefined ||
      typeof logEntry.location === "string") &&
    (logEntry.mood === undefined || typeof logEntry.mood === "string") &&
    (logEntry.visibility === undefined ||
      ["public", "friends", "private"].includes(logEntry.visibility))
  );
}

/**
 * Runtime validation functions
 */
export function validateUserData(data: unknown): UserData | null {
  if (isUserData(data)) {
    return data;
  }
  console.error("Invalid UserData:", data);
  return null;
}

export function validateLogItem(data: unknown): LogItem | null {
  if (isLogItem(data)) {
    return data;
  }
  console.error("Invalid LogItem:", data);
  return null;
}

export function validateLogEntry(data: unknown): LogEntry | null {
  if (isLogEntry(data)) {
    return data;
  }
  console.error("Invalid LogEntry:", data);
  return null;
}
