import {
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  Firestore,
  Unsubscribe,
} from "firebase/firestore";
import { db, isConfigured } from "../firebase";
import {
  UserData,
  OrganizedLogEntry,
  validateLogEntry,
} from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";
import { compareDates } from "../../lib/utils/dateUtils";

function getDb(): Firestore {
  if (!isConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Please set up your Firebase credentials."
    );
  }
  return db;
}

/**
 * Subscribe to real-time updates for a user's logs
 */
export const subscribeToUserLogs = (
  userId: string,
  onUpdate: (logs: OrganizedLogEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!isConfigured) {
    onError(new Error("Firebase not configured"));
    return () => {}; // Return empty unsubscribe function
  }

  const db = getDb();

  // Subscribe to the user's document changes
  const userDocRef = doc(db, "users", userId);

  return onSnapshot(
    userDocRef,
    (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserData;
          const logs = userData.logs || [];

          // Convert logs to organized format
          const organizedLogs: OrganizedLogEntry[] = logs
            .filter((log) => validateLogEntry(log))
            .map((log) => ({
              user: userData.name || userId,
              dateTimeStr: log.dateTimeStr,
              duration: log.duration,
              tags: log.tags,
              description: log.description || null,
            }));

          // Sort by date (newest first)
          organizedLogs.sort((a, b) =>
            compareDates(a.dateTimeStr, b.dateTimeStr)
          );

          onUpdate(organizedLogs);
        } else {
          onUpdate([]);
        }
      } catch (error) {
        if (error instanceof Error) {
          logError("Error processing user logs update", error, {
            component: "realtimeService",
            function: "subscribeToUserLogs",
            metadata: { userId },
          });
          onError(error);
        }
      }
    },
    (error) => {
      if (error instanceof Error) {
        logError("Error in user logs subscription", error, {
          component: "realtimeService",
          function: "subscribeToUserLogs",
          metadata: { userId },
        });
        onError(error);
      }
    }
  );
};

/**
 * Subscribe to real-time updates for multiple users (friends feed)
 */
export const subscribeToFriendsLogs = (
  userId: string,
  onUpdate: (logs: OrganizedLogEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!isConfigured) {
    onError(new Error("Firebase not configured"));
    return () => {}; // Return empty unsubscribe function
  }

  const db = getDb();
  let unsubscribeFunctions: Unsubscribe[] = [];

  // First, get the user's friends list
  const getFriendsAndSubscribe = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        onUpdate([]);
        return;
      }

      const userData = userDoc.data();
      const friends = userData.friends || [];

      // Include the user themselves in the feed
      const allUserIds = [userId, ...friends];

      // Clean up any existing subscriptions
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      unsubscribeFunctions = [];

      // Subscribe to each user
      for (const friendId of allUserIds) {
        const unsubscribe = subscribeToUserLogs(
          friendId,
          () => {
            // When we get updates from any user, combine all logs
            // This is a simple approach - in production, you might want
            // to optimize this to avoid recomputing the entire list
            combineAndUpdateLogs();
          },
          onError
        );
        unsubscribeFunctions.push(unsubscribe);
      }

      // Initial combine
      await combineAndUpdateLogs();

      async function combineAndUpdateLogs() {
        try {
          // Get all logs from all users
          const combinedLogs: OrganizedLogEntry[] = [];

          for (const friendId of allUserIds) {
            const userDocRef = doc(db, "users", friendId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              const logs = userData.logs || [];

              const userLogs = logs
                .filter((log) => validateLogEntry(log))
                .map((log) => ({
                  user: userData.name || friendId,
                  dateTimeStr: log.dateTimeStr,
                  duration: log.duration,
                  tags: log.tags,
                  description: log.description || null,
                }));

              combinedLogs.push(...userLogs);
            }
          }

          // Sort by date (newest first)
          combinedLogs.sort((a, b) =>
            compareDates(a.dateTimeStr, b.dateTimeStr)
          );

          onUpdate(combinedLogs);
        } catch (error) {
          if (error instanceof Error) {
            logError("Error combining friends logs", error, {
              component: "realtimeService",
              function: "subscribeToFriendsLogs",
              metadata: { userId },
            });
            onError(error);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logError("Error setting up friends logs subscription", error, {
          component: "realtimeService",
          function: "subscribeToFriendsLogs",
          metadata: { userId },
        });
        onError(error);
      }
    }
  };

  // Start the process
  getFriendsAndSubscribe();

  // Return a function to unsubscribe from all subscriptions
  return () => {
    unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
  };
};

/**
 * Subscribe to real-time presence updates for a user
 */
export const subscribeToUserPresence = (
  userId: string,
  onUpdate: (isOnline: boolean, lastActive?: string) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!isConfigured) {
    onError(new Error("Firebase not configured"));
    return () => {};
  }

  const db = getDb();
  const presenceRef = doc(db, "presence", userId);

  return onSnapshot(
    presenceRef,
    (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const presenceData = docSnapshot.data();
          onUpdate(presenceData.online || false, presenceData.lastActive);
        } else {
          onUpdate(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          logError("Error processing presence update", error, {
            component: "realtimeService",
            function: "subscribeToUserPresence",
            metadata: { userId },
          });
          onError(error);
        }
      }
    },
    (error) => {
      if (error instanceof Error) {
        logError("Error in presence subscription", error, {
          component: "realtimeService",
          function: "subscribeToUserPresence",
          metadata: { userId },
        });
        onError(error);
      }
    }
  );
};

/**
 * Update user presence status
 */
export const updateUserPresence = async (
  userId: string,
  isOnline: boolean,
  lastActive?: string
): Promise<void> => {
  if (!isConfigured) {
    return;
  }

  try {
    const db = getDb();
    const presenceRef = doc(db, "presence", userId);

    await setDoc(
      presenceRef,
      {
        online: isOnline,
        lastActive: lastActive || new Date().toISOString(),
        userId,
      },
      { merge: true }
    );
  } catch (error) {
    if (error instanceof Error) {
      logError("Error updating user presence", error, {
        component: "realtimeService",
        function: "updateUserPresence",
        metadata: { userId, isOnline },
      });
    }
    throw error;
  }
};

// Helper function for setDoc (would need to import from firebase/firestore)
// declare const setDoc: any;
