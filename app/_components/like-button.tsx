"use client";

import { useState } from "react";

interface LikeButtonProps {
  initialLikes?: number;
  logId?: string;
}

export default function LikeButton({
  initialLikes = 0,
  //logId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  function handleLikeClick() {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  }

  return (
    <button
      type="button"
      onClick={handleLikeClick}
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
      aria-label={liked ? "Unlike this log" : "Like this log"}
      aria-pressed={liked}
    >
      <svg
        className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        {liked ? (
          <path
            fill="currentColor"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        ) : (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        )}
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}
