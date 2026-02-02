/**
 * Utility functions for extracting values from Firebase data structures
 */

/**
 * Unwraps a Firebase value that might be wrapped in a type object
 * e.g., { stringValue: "1705987140" } -> "1705987140"
 * or { integerValue: "1705987140" } -> "1705987140"
 */
function unwrapFirebaseValue(value: unknown): unknown {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const obj = value as Record<string, unknown>;

  // Check for Firebase type wrappers
  if (typeof obj.stringValue !== "undefined") {
    return obj.stringValue;
  }

  if (typeof obj.integerValue !== "undefined") {
    return obj.integerValue;
  }

  if (typeof obj.doubleValue !== "undefined") {
    return obj.doubleValue;
  }

  if (typeof obj.timestampValue !== "undefined") {
    return obj.timestampValue;
  }

  if (typeof obj.booleanValue !== "undefined") {
    return obj.booleanValue;
  }

  if (typeof obj.arrayValue !== "undefined") {
    return obj.arrayValue;
  }

  if (typeof obj.mapValue !== "undefined") {
    return obj.mapValue;
  }

  // Not a wrapper, return as-is
  return value;
}

/**
 * Extracts a string value from a Firebase field.
 * Firebase can return fields in different formats:
 * - Direct value: "1705987140"
 * - With type wrapper: { stringValue: "1705987140" }
 * - With integerValue: { integerValue: "1705987140" }
 */
export function extractStringValue(value: unknown): string | undefined {
  // First unwrap any Firebase type wrappers
  const unwrapped = unwrapFirebaseValue(value);

  if (typeof unwrapped === "string") {
    return unwrapped;
  }

  if (typeof unwrapped === "number") {
    return unwrapped.toString();
  }

  if (typeof unwrapped === "boolean") {
    return unwrapped.toString();
  }

  return undefined;
}

/**
 * Extracts an array value from a Firebase field.
 */
export function extractArrayValue<T>(
  value: unknown,
  itemExtractor: (item: unknown) => T | undefined
): T[] | undefined {
  // First unwrap any Firebase type wrappers
  const unwrapped = unwrapFirebaseValue(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped
      .map(itemExtractor)
      .filter((item): item is T => item !== undefined);
  }

  return undefined;
}

/**
 * Safely extracts log data from Firebase document data
 */
export function extractLogFromFirebase(logData: unknown): {
  createdAt: string;
  duration: string;
  tags: string[];
  description: string | null;
} | null {
  if (typeof logData !== "object" || logData === null) {
    return null;
  }

  const log = logData as Record<string, unknown>;

  // Firebase may wrap fields in type objects like { stringValue: "..." }
  // We need to unwrap them first, then extract the string value
  const createdAt = extractStringValue(log.createdAt);
  const duration = extractStringValue(log.duration);
  const description = extractStringValue(log.description);

  // Extract tags array
  let tags: string[] = [];
  const unwrappedTags = unwrapFirebaseValue(log.tags);
  if (Array.isArray(unwrappedTags)) {
    tags = unwrappedTags
      .map((tag) => extractStringValue(tag))
      .filter((tag): tag is string => tag !== undefined);
  }

  if (!createdAt || !duration) {
    return null;
  }

  return {
    createdAt,
    duration,
    tags,
    description: description || null,
  };
}
