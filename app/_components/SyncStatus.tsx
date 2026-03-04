"use client";

import React from "react";
import { useOfflineSync } from "../_hooks/useOfflineSync";
import { UserAuth } from "../context/AuthContext";
import styles from "./SyncStatus.module.css";

export function SyncStatus() {
  const { user } = UserAuth();
  const { isOnline, pendingCount, isSyncing, lastSyncTime } = useOfflineSync(
    user?.uid
  );

  if (isOnline && pendingCount === 0) {
    // All good, no need to show anything or show a small check
    return (
      <div
        className={styles.container}
        title={`Last synced: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : "never"}`}
      >
        <span className={`${styles.status} ${styles.online}`}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className={`${styles.container} ${styles.offline}`}
        title="You are offline"
      >
        <span className={`${styles.status} ${styles.offlineIndicator}`}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className={styles.text}>Offline</span>
        </span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div
        className={`${styles.container} ${styles.syncing}`}
        title={`${pendingCount} pending operation${pendingCount !== 1 ? "s" : ""}`}
      >
        <span className={`${styles.status} ${styles.pending}`}>
          {isSyncing ? (
            <svg
              className={`${styles.icon} ${styles.spin}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className={styles.icon}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className={styles.text}>
            {isSyncing ? "Syncing..." : `${pendingCount} pending`}
          </span>
        </span>
        <button
          className={styles.syncButton}
          onClick={() => window.dispatchEvent(new CustomEvent("force-sync"))}
          disabled={isSyncing}
        >
          Sync now
        </button>
      </div>
    );
  }

  return null;
}
