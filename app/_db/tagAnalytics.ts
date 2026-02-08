/**
 * Tag analytics utilities for tracking tag usage counts
 */

import { LogItem } from "../../types/index";

/**
 * Updates the tag analytics object by incrementing counts for given tags
 * @param currentAnalytics - Existing tag analytics object
 * @param tags - Tags to increment
 * @returns New tag analytics object with updated counts
 */
export function updateTagAnalytics(
  currentAnalytics: Record<string, number> | undefined,
  tags: string[]
): Record<string, number> {
  const analytics = { ...currentAnalytics };

  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();
    analytics[normalizedTag] = (analytics[normalizedTag] || 0) + 1;
  }

  return analytics;
}

/**
 * Decrements tag counts (useful when removing logs)
 * @param currentAnalytics - Existing tag analytics object
 * @param tags - Tags to decrement
 * @returns New tag analytics object with decremented counts
 */
export function decrementTagAnalytics(
  currentAnalytics: Record<string, number> | undefined,
  tags: string[]
): Record<string, number> {
  if (!currentAnalytics) {
    return {};
  }

  const analytics = { ...currentAnalytics };

  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();
    if (analytics[normalizedTag]) {
      analytics[normalizedTag] = Math.max(0, analytics[normalizedTag] - 1);
    }
  }

  return analytics;
}

/**
 * Gets tag analytics from a user's logs
 * @param logs - User's log items
 * @returns Tag analytics object with counts
 */
export function calculateTagAnalyticsFromLogs(
  logs: LogItem[]
): Record<string, number> {
  const analytics: Record<string, number> = {};

  for (const log of logs) {
    for (const tag of log.tags) {
      const normalizedTag = tag.toLowerCase();
      analytics[normalizedTag] = (analytics[normalizedTag] || 0) + 1;
    }
  }

  return analytics;
}
