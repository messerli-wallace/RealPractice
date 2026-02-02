import React from "react";
import LikeButton from "./like-button";
import styles from "./Log.module.css";

interface LogProps {
  log: {
    user: string;
    dateTimeStr: string;
    duration: string;
    tags: string[];
    description: string | null;
    index: number;
  };
}

export const Log: React.FC<LogProps> = ({ log }) => {
  return (
    <div className={styles.logCard}>
      <div className={styles.logHeader}>
        <div className={styles.logHeaderContent}>
          <h2 className={styles.logTitle}>Practice Log</h2>
          <LikeButton logId={log.index?.toString()} />
        </div>
      </div>
      <div className={styles.logBody}>
        <div className={styles.logGrid}>
          <div className={styles.logSection}>
            <p className={styles.logLabel}>User</p>
            <p className={styles.logValue}>{log.user}</p>
          </div>
          <div className={styles.logSection}>
            <p className={styles.logLabel}>Duration</p>
            <p className={styles.logValue}>{log.duration}</p>
          </div>
        </div>
        <div className={styles.sectionSpacing}>
          <p className={`${styles.logLabel} ${styles.mb1}`}>Date & Time</p>
          <p className={styles.logValue}>{log.dateTimeStr}</p>
        </div>
        <div className={styles.sectionSpacing}>
          <p className={`${styles.logLabel} ${styles.mb2}`}>Tags</p>
          <div className={styles.tagsContainer}>
            {log.tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                {tag}
              </span>
            ))}
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
