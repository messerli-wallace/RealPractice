/**
 * Network-related utility functions for RealPractice application
 */

/**
 * Determines if an error is network-related based on error message content
 * @param error - The error to check
 * @returns true if the error is network-related, false otherwise
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("failed to fetch") ||
      error.message.includes("offline")
    );
  }
  return false;
}
