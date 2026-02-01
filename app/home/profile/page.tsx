"use client";
import React, { useEffect, useState } from "react";
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
  const { user } = UserAuth(); //user data if logged in
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

  // Load friends list when user is available
  useEffect(() => {
    const loadFriends = async () => {
      if (user?.uid) {
        setFriendsLoading(true);
        setError(null);
        try {
          const friendIds = await getFriends(user.uid);

          // Fetch user data for each friend
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {loading ? (
        <LoadingImage />
      ) : user ? (
        <div className="space-y-6">
          {/* User info */}
          <div>
            <p className="text-base sm:text-lg">Welcome, {user.displayName}</p>
          </div>

          {/* Following Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Following ({friends.length})
            </h2>

            {error && (
              <div className="mb-4">
                <Alert variant="error" title="Error">
                  {error}
                </Alert>
              </div>
            )}

            {friendsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingImage />
              </div>
            ) : friends.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500">
                  You are not following anyone yet.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Use the search page to find and follow users.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                        {(friend.data?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {friend.data?.name || "Unknown User"}
                        </h3>
                        {friend.data?.bio && (
                          <p className="text-sm text-gray-600 truncate">
                            {friend.data.bio}
                          </p>
                        )}
                        {!friend.data && (
                          <p className="text-xs text-gray-400">
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
        <div className="px-4 py-6 sm:py-8">
          <p className="text-sm sm:text-base">
            You must be logged in to view this page - protected route.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
