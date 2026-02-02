"use client";
import React, { useRef, useCallback, useState } from "react";
import styles from "./page.module.css";
import CreateLog from "../_components/CreateLog";
import Log from "../_components/log";
import { FilterBar } from "../_components/FilterBar";
import { useLogs } from "../context/LogsContext";
import { SkeletonCard } from "../_components/Skeleton";
import { Alert } from "../_components/DesignSystem";

export default function Home() {
  const {
    logs,
    loading,
    error,
    hasMore,
    loadMoreLogs,
    tagFilter,
    setTagFilter,
    userFilter,
    setUserFilter,
    showOnlyMine,
    setShowOnlyMine,
    clearFilters,
    currentUserName,
  } = useLogs();
  const observer = useRef<IntersectionObserver | null>(null);
  const [showCreateLog, setShowCreateLog] = useState(false);

  const lastLogElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreLogs();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMoreLogs]
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Home</h1>

      {error && (
        <div className={styles.mb4}>
          <Alert variant="error" title="Error loading logs">
            {error.message}
          </Alert>
        </div>
      )}

      <div className={styles.mb6}>
        {!showCreateLog ? (
          <button
            onClick={() => setShowCreateLog(true)}
            className={styles.newLogButton}
          >
            New Log
          </button>
        ) : (
          <div className={styles.createLogWrapper}>
            <div className={styles.createLogHeader}>
              <button
                onClick={() => setShowCreateLog(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
            <CreateLog />
          </div>
        )}
      </div>

      <FilterBar
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        showOnlyMine={showOnlyMine}
        setShowOnlyMine={setShowOnlyMine}
        currentUserName={currentUserName}
        hasActiveFilters={!!tagFilter || !!userFilter || showOnlyMine}
        clearFilters={clearFilters}
      />

      <div>
        <h2 className={styles.sectionTitle}>Recent Logs</h2>

        {loading && logs.length === 0 ? (
          <SkeletonCard count={3} />
        ) : logs.length === 0 ? (
          <p className={styles.emptyMessage}>
            No logs found. Create your first log!
          </p>
        ) : (
          <div>
            {logs.map((log, index) => (
              <React.Fragment key={index}>
                <Log log={{ ...log, index }} />
              </React.Fragment>
            ))}
            {loading && hasMore && (
              <div className={styles.loadingContainer}>
                <SkeletonCard count={1} />
              </div>
            )}
            {!hasMore && (
              <div className={styles.endMessage}>
                <p>You&apos;ve reached the end!</p>
              </div>
            )}
            <div ref={lastLogElementRef} />
          </div>
        )}
      </div>
    </div>
  );
}
