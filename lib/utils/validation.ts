/**
 * Comprehensive input validation and sanitization utilities
 * for the RealPractice application
 */

// Input validation constants
const VALIDATION_CONSTANTS = {
  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 1000,
  DURATION_MIN: 1,
  DURATION_MAX: 1440, // 24 hours in minutes
  TAG_MAX_LENGTH: 30,
  MAX_TAGS: 5,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 50,
} as const;

/**
 * Validates and sanitizes log description input
 */
export function validateDescription(description: string): {
  valid: boolean;
  error?: string;
  sanitized: string;
} {
  // Sanitize first
  const sanitized = sanitizeText(description);

  if (sanitized.length < VALIDATION_CONSTANTS.DESCRIPTION_MIN_LENGTH) {
    return {
      valid: false,
      error: `Description must be at least ${VALIDATION_CONSTANTS.DESCRIPTION_MIN_LENGTH} character`,
      sanitized,
    };
  }

  if (sanitized.length > VALIDATION_CONSTANTS.DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: `Description cannot exceed ${VALIDATION_CONSTANTS.DESCRIPTION_MAX_LENGTH} characters`,
      sanitized,
    };
  }

  return { valid: true, sanitized };
}

/**
 * Validates and sanitizes duration input
 */
export function validateDuration(duration: string): {
  valid: boolean;
  error?: string;
  sanitized: string;
} {
  // Remove any non-digit characters
  const sanitized = duration.replace(/[^0-9]/g, "");

  if (sanitized === "") {
    return { valid: false, error: "Duration is required", sanitized: "" };
  }

  const numericValue = parseInt(sanitized, 10);

  if (isNaN(numericValue)) {
    return {
      valid: false,
      error: "Duration must be a valid number",
      sanitized: "",
    };
  }

  if (numericValue < VALIDATION_CONSTANTS.DURATION_MIN) {
    return {
      valid: false,
      error: `Duration must be at least ${VALIDATION_CONSTANTS.DURATION_MIN} minute`,
      sanitized,
    };
  }

  if (numericValue > VALIDATION_CONSTANTS.DURATION_MAX) {
    return {
      valid: false,
      error: `Duration cannot exceed ${VALIDATION_CONSTANTS.DURATION_MAX} minutes (24 hours)`,
      sanitized,
    };
  }

  return { valid: true, sanitized };
}

/**
 * Validates tags array
 */
export function validateTags(tags: string[]): {
  valid: boolean;
  error?: string;
  sanitized: string[];
} {
  if (tags.length === 0) {
    return {
      valid: false,
      error: "At least one tag is required",
      sanitized: [],
    };
  }

  if (tags.length > VALIDATION_CONSTANTS.MAX_TAGS) {
    return {
      valid: false,
      error: `Cannot have more than ${VALIDATION_CONSTANTS.MAX_TAGS} tags`,
      sanitized: tags.slice(0, VALIDATION_CONSTANTS.MAX_TAGS),
    };
  }

  // Sanitize each tag
  const sanitizedTags = tags.map((tag) => {
    const sanitized = sanitizeText(tag);
    return sanitized.length > VALIDATION_CONSTANTS.TAG_MAX_LENGTH
      ? sanitized.substring(0, VALIDATION_CONSTANTS.TAG_MAX_LENGTH)
      : sanitized;
  });

  return { valid: true, sanitized: sanitizedTags };
}

/**
 * Validates user name
 */
export function validateName(name: string): {
  valid: boolean;
  error?: string;
  sanitized: string;
} {
  const sanitized = sanitizeText(name);

  if (sanitized.length < VALIDATION_CONSTANTS.NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} character`,
      sanitized,
    };
  }

  if (sanitized.length > VALIDATION_CONSTANTS.NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Name cannot exceed ${VALIDATION_CONSTANTS.NAME_MAX_LENGTH} characters`,
      sanitized,
    };
  }

  return { valid: true, sanitized };
}

/**
 * Validates a complete log entry
 */
export function validateLogEntry(log: {
  duration: string;
  description: string;
  tags: string[];
}): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    duration: string;
    description: string;
    tags: string[];
  };
} {
  const errors: Record<string, string> = {};

  // Validate duration
  const durationValidation = validateDuration(log.duration);
  if (!durationValidation.valid && durationValidation.error) {
    errors.duration = durationValidation.error;
  }

  // Validate description
  const descriptionValidation = validateDescription(log.description);
  if (!descriptionValidation.valid && descriptionValidation.error) {
    errors.description = descriptionValidation.error;
  }

  // Validate tags
  const tagsValidation = validateTags(log.tags);
  if (!tagsValidation.valid && tagsValidation.error) {
    errors.tags = tagsValidation.error;
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      duration: durationValidation.sanitized,
      description: descriptionValidation.sanitized,
      tags: tagsValidation.sanitized,
    },
  };
}

/**
 * Sanitizes text input to prevent XSS and injection attacks
 */
function sanitizeText(input: string): string {
  if (!input) return "";

  // Basic HTML tag removal
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove potentially dangerous characters while preserving basic formatting
  sanitized = sanitized.replace(/["'\\]/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validates datetime string format
 */
export function validateDateTimeString(dateTimeStr: string): boolean {
  // Basic format validation: MM-DD-YYYY-HH-MM-GMT-N
  const datetimeRegex = /^\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-GMT[+-]?\d+$/;
  return datetimeRegex.test(dateTimeStr);
}
