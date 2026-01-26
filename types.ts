import { User as FirebaseUser } from "firebase/auth";

export interface LogItem {
  id: string;
  dateTimeStr: string;
  duration: string;
  description: string;
  tags: string[];
  createdAt: number;
}

export interface UserData {
  name: string | null;
  email: string | null;
  logs?: LogItem[];
  createdAt?: number;
}

export type UserLogData = Record<string, LogItem[]>;

export interface OrganizedLogEntry {
  user: string;
  dateTimeStr: string;
  duration: string;
  tags: string[];
  description: string | null;
}

export interface SearchResult {
  users: SearchResultItem[];
  logs: SearchResultItem[];
}

export interface SearchResultItem {
  id: string;
  name: string;
  type: "user" | "log";
  description?: string;
  tags?: string[];
}

export type User = FirebaseUser;

export function validateLogItem(data: unknown): data is LogItem {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const item = data as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.dateTimeStr === "string" &&
    typeof item.duration === "string" &&
    typeof item.description === "string" &&
    Array.isArray(item.tags) &&
    typeof item.createdAt === "number"
  );
}

export function validateUserData(data: unknown): data is UserData {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const userData = data as Record<string, unknown>;
  return (
    (userData.name === null || typeof userData.name === "string") &&
    (userData.email === null || typeof userData.email === "string") &&
    (userData.logs === undefined ||
      (Array.isArray(userData.logs) &&
        userData.logs.every((log) => validateLogItem(log)))) &&
    (userData.createdAt === undefined || typeof userData.createdAt === "number")
  );
}
