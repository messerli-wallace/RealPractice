"use client";
import React from "react";
import styles from "./Skeleton.module.css";
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
    <div className={styles.skeletonCard}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCardItem}>
          <div className={styles.cardHeader}>
            <Skeleton width="80px" height="24px" />
            {showSpinner ? (
              <div style={{ width: "24px", height: "24px" }}>
                <LoadingGif />
              </div>
            ) : (
              <Skeleton width="24px" height="24px" borderRadius="9999px" />
            )}
          </div>

          <div className={styles.spaceY2}>
            <Skeleton width="60px" height="16px" />
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100px" height="16px" />
            <Skeleton width="80px" height="16px" />
          </div>

          <div className={styles.tagsContainer}>
            <Skeleton width="50px" height="20px" borderRadius="9999px" />
            <Skeleton width="40px" height="20px" borderRadius="9999px" />
            <Skeleton width="60px" height="20px" borderRadius="9999px" />
          </div>

          <div className={styles.descriptionContainer}>
            <Skeleton width="100%" height="60px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
