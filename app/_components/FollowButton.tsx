"use client";

import React, { useState } from "react";
import { Button } from "./DesignSystem";
import { logError } from "../../lib/utils/errorLogger";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  size?: "sm" | "md" | "lg";
}

export function FollowButton({
  targetUserId,
  isFollowing,
  onFollow,
  size = "sm",
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (isFollowing) {
      return;
    }

    try {
      setIsLoading(true);
      await onFollow();
    } catch (error) {
      if (error instanceof Error) {
        logError("Failed to follow user", error, {
          component: "FollowButton",
          function: "handleFollow",
          metadata: { targetUserId },
        });
      }
      // Error is already logged, we just show the button as not clicked
      // The parent component can show a toast or other notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isFollowing || isLoading}
      isLoading={isLoading}
      variant={isFollowing ? "secondary" : "primary"}
      size={size}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
