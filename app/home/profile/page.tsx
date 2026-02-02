"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { UserAuth } from "../../context/AuthContext";
import LoadingImage from "../../_components/LoadingGif";
import { getFriends, getUserById } from "../../_db/db";
import { UserData } from "../../../types/index";
import { logError } from "../../../lib/utils/errorLogger";
import { Card, Alert } from "../../_components/DesignSystem";

interface FriendWithData {
  id: string;
  data: UserData | null;
}

const ProfilePage = () => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendWithData[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  useEffect(() => {
    const loadFriends = async () => {
      if (user?.uid) {
        setFriendsLoading(true);
        setError(null);
        try {
          const friendIds = await getFriends(user.uid);

          const friendsData = await Promise.all(
            friendIds.map(async (friendId) => {
              try {
                const friendData = await getUserById(friendId);
                return { id: friendId, data: friendData };
              } catch (err) {
                logError(
                  "Failed to load friend data",
                  err instanceof Error ? err : new Error("Unknown error"),
                  {
                    component: "profile",
                    function: "loadFriends",
                    metadata: { friendId },
                  }
                );
                return { id: friendId, data: null };
              }
            })
          );

          setFriends(friendsData);
        } catch (err) {
          logError(
            "Failed to load friends list",
            err instanceof Error ? err : new Error("Unknown error"),
            {
              component: "profile",
              function: "loadFriends",
              metadata: { userId: user.uid },
            }
          );
          setError("Failed to load your following list. Please try again.");
        } finally {
          setFriendsLoading(false);
        }
      }
    };

    loadFriends();
  }, [user?.uid]);

  return (
    <div className={styles.container}>
      {loading ? (
        <LoadingImage />
      ) : user ? (
        <div className={styles.spaceY6}>
          {/* User info */}
          <div>
            <p className={styles.welcome}>Welcome, {user.displayName}</p>
          </div>

          {/* Following Section */}
          <div>
            <h2 className={styles.sectionTitle}>
              Following ({friends.length})
            </h2>

            {error && (
              <div className={styles.errorContainer}>
                <Alert variant="error" title="Error">
                  {error}
                </Alert>
              </div>
            )}

            {friendsLoading ? (
              <div className={styles.loadingContainer}>
                <LoadingImage />
              </div>
            ) : friends.length === 0 ? (
              <Card className={styles.emptyCard}>
                <p className={styles.emptyText}>
                  You are not following anyone yet.
                </p>
                <p className={styles.helpText}>
                  Use the search page to find and follow users.
                </p>
              </Card>
            ) : (
              <div className={styles.friendsGrid}>
                {friends.map((friend) => (
                  <Card key={friend.id} className={styles.friendCard}>
                    <div className={styles.friendContent}>
                      <div className={styles.friendAvatar}>
                        {(friend.data?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.friendInfo}>
                        <h3 className={styles.friendName}>
                          {friend.data?.name || "Unknown User"}
                        </h3>
                        {friend.data?.bio && (
                          <p className={styles.friendBio}>{friend.data.bio}</p>
                        )}
                        {!friend.data && (
                          <p className={styles.unavailableText}>
                            User data unavailable
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.notLoggedIn}>
          <p className={styles.notLoggedInText}>
            You must be logged in to view this page - protected route.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
