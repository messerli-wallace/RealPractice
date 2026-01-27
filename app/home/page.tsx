"use client";
import React, { useRef, useCallback, useState } from "react";
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
    <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Home</h1>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error loading logs">
            {error.message}
          </Alert>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        {!showCreateLog ? (
          <button
            onClick={() => setShowCreateLog(true)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            New Log
          </button>
        ) : (
          <div className="overflow-hidden transition-all duration-500 ease-in-out">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowCreateLog(false)}
                className="text-gray-600 hover:text-gray-800 font-medium"
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
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
          Recent Logs
        </h2>

        {loading && logs.length === 0 ? (
          <SkeletonCard count={3} />
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
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
              <div className="py-3 sm:py-4">
                <SkeletonCard count={1} />
              </div>
            )}
            {!hasMore && (
              <div className="flex justify-center py-3 sm:py-4">
                <p className="text-gray-400 text-xs sm:text-sm">
                  You&apos;ve reached the end!
                </p>
              </div>
            )}
            <div ref={lastLogElementRef} />
          </div>
        )}
      </div>
    </div>
  );
}
