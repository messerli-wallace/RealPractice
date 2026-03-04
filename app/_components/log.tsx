"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LikeButton from "./like-button";
import styles from "./Log.module.css";
import { toReadableString } from "../../lib/utils/dateUtils";
import { UserAuth } from "../context/AuthContext";
import { removeLog } from "../_db/db";
import type { OrganizedLogEntry, LogItem } from "../../types/index";

interface LogProps {
  log: OrganizedLogEntry & { index: number };
}

export const Log: React.FC<LogProps> = ({ log }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = UserAuth();

  const visibleTags = showAllTags ? log.tags : log.tags.slice(0, 2);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDeleteMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this log?"
    );
    if (!confirmed) return;

    try {
      // The log object includes extra fields (user, userId) added for display.
      // The stored log in Firestore does not have these fields, so we need to
      // create a clean LogItem object containing only the original log fields.
      const { user: _user, userId: ownerId, ...logItem } = log;
      await removeLog(ownerId, logItem as LogItem);
      setShowDeleteMenu(false);
    } catch (error) {
      console.error("Failed to delete log:", error);
      // Optionally show an error message to the user
    }
  };

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
          <div className={styles.headerActions}>
            <LikeButton logId={log.index?.toString()} />
            {currentUser && log.userId === currentUser.uid && (
              <div className={styles.menuContainer} ref={menuRef}>
                <button
                  className={styles.menuButton}
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  aria-label="Open menu"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
                {showDeleteMenu && (
                  <div className={styles.dropdownMenu}>
                    <button
                      className={styles.deleteMenuItem}
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
