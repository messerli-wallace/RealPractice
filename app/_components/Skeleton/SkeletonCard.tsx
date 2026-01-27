"use client";
import React from "react";
import { Skeleton } from "./Skeleton";
import LoadingGif from "../LoadingGif";

interface SkeletonCardProps {
  count?: number;
  showSpinner?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  showSpinner = false,
}) => {
  return (
    <div className="skeleton-card">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="log skeleton-card-item">
          <div className="flex justify-between items-start mb-3">
            <Skeleton width="80px" height="24px" />
            {showSpinner ? (
              <div className="w-6 h-6">
                <LoadingGif />
              </div>
            ) : (
              <Skeleton width="24px" height="24px" borderRadius="9999px" />
            )}
          </div>

          <div className="space-y-2">
            <Skeleton width="60px" height="16px" />
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100px" height="16px" />
            <Skeleton width="80px" height="16px" />
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            <Skeleton width="50px" height="20px" borderRadius="9999px" />
            <Skeleton width="40px" height="20px" borderRadius="9999px" />
            <Skeleton width="60px" height="20px" borderRadius="9999px" />
          </div>

          <div className="mt-3">
            <Skeleton width="100%" height="60px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
