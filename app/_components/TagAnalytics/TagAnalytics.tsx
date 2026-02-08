"use client";

import React from "react";
import styles from "./TagAnalytics.module.css";

interface TagAnalyticsProps {
  tagAnalytics?: Record<string, number>;
  className?: string;
}

export function TagAnalytics({
  tagAnalytics,
  className = "",
}: TagAnalyticsProps) {
  if (!tagAnalytics || Object.keys(tagAnalytics).length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p className={styles.emptyText}>
          No tag analytics available yet. Start practicing to track your
          progress!
        </p>
      </div>
    );
  }

  const sortedTags = Object.entries(tagAnalytics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalPractices = Object.values(tagAnalytics).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className={`${styles.container} ${className}`}>
      <h2 className={styles.title}>Tag Analytics</h2>
      <div className={styles.summary}>
        <span className={styles.totalLabel}>Total Practices:</span>
        <span className={styles.totalValue}>{totalPractices}</span>
      </div>

      <div className={styles.tagList}>
        {sortedTags.map(([tagName, count]) => {
          const percentage = (count / totalPractices) * 100;
          return (
            <div key={tagName} className={styles.tagItem}>
              <div className={styles.tagInfo}>
                <span className={styles.tagName}>
                  {tagName.charAt(0).toUpperCase() + tagName.slice(1)}
                </span>
                <span className={styles.tagCount}>{count}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TagAnalytics;
