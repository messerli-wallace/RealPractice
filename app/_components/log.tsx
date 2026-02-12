import React, { useState } from "react";
import Link from "next/link";
import LikeButton from "./like-button";
import styles from "./Log.module.css";
import { toReadableString } from "../../lib/utils/dateUtils";

interface LogProps {
  log: {
    user: string;
    userId: string;
    createdAt: string;
    duration: string;
    tags: string[];
    description: string | null;
    index: number;
  };
}

export const Log: React.FC<LogProps> = ({ log }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags ? log.tags : log.tags.slice(0, 2);

  return (
    <div className={styles.logCard}>
      <div className={styles.logHeader}>
        <div className={styles.logHeaderContent}>
          <div className={styles.headerLeftContent}>
            <Link
              href={`/home/user?userId=${log.userId}`}
              className={styles.userName}
            >
              {log.user}
            </Link>
            <div className={styles.tagsHeaderContainer}>
              {log.tags.length === 0 && (
                <span className={styles.headerTag}>—</span>
              )}
              {visibleTags.map((tag, idx) => (
                <span key={idx} className={styles.headerTag}>
                  {tag}
                </span>
              ))}
              {!showAllTags && log.tags.length > 2 && (
                <button
                  className={styles.moreIndicator}
                  onClick={() => setShowAllTags(true)}
                >
                  +{log.tags.length - 2} more
                </button>
              )}
              {showAllTags && log.tags.length > 2 && (
                <button
                  className={styles.moreIndicator}
                  onClick={() => setShowAllTags(false)}
                >
                  show less
                </button>
              )}
            </div>
          </div>
          <LikeButton logId={log.index?.toString()} />
        </div>
      </div>
      <div className={styles.logBody}>
        <div className={styles.logGrid}>
          <div className={styles.logSection}>
            <p className={styles.logLabel}>Duration</p>
            <p className={styles.logValue}>{log.duration}</p>
          </div>
          <div className={styles.logSection}>
            <p className={styles.logLabel}>Date & Time</p>
            <p className={styles.logValue}>{toReadableString(log.createdAt)}</p>
          </div>
        </div>
        <div className={styles.sectionSpacing}>
          <p className={`${styles.logLabel} ${styles.mb2}`}>Description</p>
          <p className={styles.description}>
            {log.description || "No description provided"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Log;
