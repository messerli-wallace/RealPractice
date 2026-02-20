"use client";

import React, { useState } from "react";
import { Button } from "./DesignSystem";
import { logError } from "../../lib/utils/errorLogger";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  onFollowToggle: () => Promise<void>;
  size?: "sm" | "md" | "lg";
}

export function FollowButton({
  targetUserId,
  isFollowing,
  onFollowToggle,
  size = "sm",
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onFollowToggle();
    } catch (error) {
      if (error instanceof Error) {
        logError(
          isFollowing ? "Failed to unfollow user" : "Failed to follow user",
          error,
          {
            component: "FollowButton",
            function: "handleClick",
            metadata: { targetUserId, isFollowing },
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      isLoading={isLoading}
      variant={isFollowing ? "secondary" : "primary"}
      size={size}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
