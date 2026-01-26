"use client";
import React, { useRef, useCallback } from "react";
import CreateLog from "../_components/CreateLog";
import LikeButton from "../_components/like-button";
import Log from "../_components/log";
import { useLogs } from "../context/LogsContext";
import LoadingGif from "../_components/LoadingGif";
import { Alert } from "../_components/DesignSystem";

export default function Home() {
  const { logs, loading, error, hasMore, loadMoreLogs } = useLogs();
  const observer = useRef<IntersectionObserver | null>(null);

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
        <CreateLog />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
          Recent Logs
        </h2>

        {loading && logs.length === 0 ? (
          <div className="flex justify-center py-6 sm:py-8">
            <LoadingGif />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            No logs found. Create your first log!
          </p>
        ) : (
          <div>
            {logs.map((log, index) => (
              <React.Fragment key={index}>
                <LikeButton />
                <Log log={{ ...log, index }} />
              </React.Fragment>
            ))}
            {loading && hasMore && (
              <div className="flex justify-center py-3 sm:py-4">
                <p className="text-gray-500 text-sm">Loading more logs...</p>
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
