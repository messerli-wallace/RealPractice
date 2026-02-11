"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { UserAuth } from "../../context/AuthContext";
import LoadingImage from "../../_components/LoadingGif";
import { getUserById, getTagAnalytics } from "../../_db/db";
import { UserData } from "../../../types/index";
import { logError } from "../../../lib/utils/errorLogger";
import { Alert, Button } from "../../_components/DesignSystem";
import { TagAnalytics } from "../../_components/TagAnalytics";

const UserProfileContent = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { user: currentUser } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tagAnalytics, setTagAnalytics] = useState<
    Record<string, number> | undefined
  >();
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getUserById(userId);
        if (data) {
          setUserData(data);
        } else {
          setError("User not found");
        }
      } catch (err) {
        logError(
          "Failed to load user data",
          err instanceof Error ? err : new Error("Unknown error"),
          {
            component: "UserProfileContent",
            function: "loadUserData",
            metadata: { userId },
          }
        );
        setError("Failed to load user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    const fetchTagAnalytics = async () => {
      if (!userId) {
        return;
      }

      setAnalyticsLoading(true);
      try {
        const analytics = await getTagAnalytics(userId);
        setTagAnalytics(analytics);
      } catch (err) {
        logError(
          "Failed to load tag analytics",
          err instanceof Error ? err : new Error("Unknown error"),
          {
            component: "UserProfileContent",
            function: "fetchTagAnalytics",
            metadata: { userId },
          }
        );
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchTagAnalytics();
  }, [userId]);

  const isOwnProfile = currentUser?.uid === userId;

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingImage />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
        <div className={styles.backLink}>
          <Link href="/home/profile">
            <Button variant="secondary">Back to Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.container}>
        <Alert variant="error" title="Error">
          User not found
        </Alert>
        <div className={styles.backLink}>
          <Link href="/home/profile">
            <Button variant="secondary">Back to Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.spaceY6}>
        {/* Back link */}
        <div>
          <Link href="/home/profile" className={styles.backLinkText}>
            ← Back to Profile
          </Link>
        </div>

        {/* User info */}
        <div className={styles.userHeader}>
          <div className={styles.userAvatar}>
            {(userData.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>
              {userData.name || "Unknown User"}
            </h1>
            {userData.bio && <p className={styles.userBio}>{userData.bio}</p>}
            {isOwnProfile && (
              <p className={styles.ownProfileBadge}>This is your profile</p>
            )}
          </div>
        </div>

        {/* Tag Analytics Section */}
        <div>
          <h2 className={styles.sectionTitle}>Practice Analytics</h2>
          {analyticsLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingImage />
            </div>
          ) : (
            <TagAnalytics tagAnalytics={tagAnalytics} />
          )}
        </div>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <LoadingImage />
        </div>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
};

export default UserProfilePage;
