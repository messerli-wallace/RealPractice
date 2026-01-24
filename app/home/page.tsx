"use client";
import React, { useRef, useCallback } from "react";
import CreateLog from "../_components/CreateLog";
import LikeButton from "../_components/like-button";
import Post from "../_components/post";
import { usePosts } from "../context/PostsContext";
import LoadingGif from "../_components/LoadingGif";
import { Alert } from "../_components/DesignSystem";

export default function Home() {
  const { posts, loading, error, hasMore, loadMorePosts } = usePosts();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMorePosts]
  );

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Home</h1>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error loading posts">
            {error.message}
          </Alert>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <CreateLog />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
          Recent Posts
        </h2>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-6 sm:py-8">
            <LoadingGif />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            No posts found. Create your first log!
          </p>
        ) : (
          <div>
            {posts.map((post, index) => (
              <React.Fragment key={index}>
                <LikeButton />
                <Post post={{ ...post, index }} />
              </React.Fragment>
            ))}
            {loading && hasMore && (
              <div className="flex justify-center py-3 sm:py-4">
                <p className="text-gray-500 text-sm">Loading more posts...</p>
              </div>
            )}
            {!hasMore && (
              <div className="flex justify-center py-3 sm:py-4">
                <p className="text-gray-400 text-xs sm:text-sm">
                  You&apos;ve reached the end!
                </p>
              </div>
            )}
            <div ref={lastPostElementRef} />
          </div>
        )}
      </div>
    </div>
  );
}
