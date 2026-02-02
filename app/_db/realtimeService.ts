import {
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  Firestore,
  Unsubscribe,
} from "firebase/firestore";
import { db, isConfigured } from "../firebase";
import { UserData, OrganizedLogEntry } from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";
import { compareDates } from "../../lib/utils/dateUtils";
import { extractLogFromFirebase } from "../../lib/utils/firebaseDataUtils";

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
    return () => {};
  }

  const db = getDb();
  const userDocRef = doc(db, "users", userId);

  return onSnapshot(
    userDocRef,
    (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserData;
          const logs = userData.logs || [];

          const organizedLogs: OrganizedLogEntry[] = logs
            .map((log) => extractLogFromFirebase(log))
            .filter((log): log is NonNullable<typeof log> => log !== null)
            .map((log) => ({
              user: userData.name || userId,
              createdAt: log.createdAt,
              duration: log.duration,
              tags: log.tags,
              description: log.description,
            }));

          organizedLogs.sort((a, b) => compareDates(a.createdAt, b.createdAt));

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
 * Subscribe to real-time updates for a user's logs and provide raw user data
 * Used internally to avoid N+1 queries
 */
const subscribeToUserLogsWithCache = (
  userId: string,
  onUpdate: (userData: UserData) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!isConfigured) {
    onError(new Error("Firebase not configured"));
    return () => {};
  }

  const db = getDb();
  const userDocRef = doc(db, "users", userId);

  return onSnapshot(
    userDocRef,
    (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserData;
          onUpdate(userData);
        }
      } catch (error) {
        if (error instanceof Error) {
          logError("Error in user logs cache subscription", error, {
            component: "realtimeService",
            function: "subscribeToUserLogsWithCache",
            metadata: { userId },
          });
          onError(error);
        }
      }
    },
    (error) => {
      if (error instanceof Error) {
        logError("Error in user logs cache subscription", error, {
          component: "realtimeService",
          function: "subscribeToUserLogsWithCache",
          metadata: { userId },
        });
        onError(error);
      }
    }
  );
};

/**
 * Subscribe to real-time updates for multiple users (friends feed)
 * Optimized to avoid N+1 queries by caching user data from subscriptions
 */
export const subscribeToFriendsLogs = (
  userId: string,
  onUpdate: (logs: OrganizedLogEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!isConfigured) {
    onError(new Error("Firebase not configured"));
    return () => {};
  }

  const db = getDb();
  let unsubscribeFunctions: Unsubscribe[] = [];
  const userDataCache = new Map<string, UserData>();

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
      const allUserIds = [userId, ...friends];

      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      unsubscribeFunctions = [];
      userDataCache.clear();

      for (const friendId of allUserIds) {
        const unsubscribe = subscribeToUserLogsWithCache(
          friendId,
          (userData) => {
            userDataCache.set(friendId, userData);
            combineAndUpdateLogs();
          },
          onError
        );
        unsubscribeFunctions.push(unsubscribe);
      }

      function combineAndUpdateLogs() {
        try {
          const combinedLogs: OrganizedLogEntry[] = [];

          for (const friendId of allUserIds) {
            const cachedUserData = userDataCache.get(friendId);
            if (cachedUserData) {
              const logs = cachedUserData.logs || [];
              const userLogs = logs
                .map((log) => extractLogFromFirebase(log))
                .filter((log): log is NonNullable<typeof log> => log !== null)
                .map((log) => ({
                  user: cachedUserData.name || friendId,
                  createdAt: log.createdAt,
                  duration: log.duration,
                  tags: log.tags,
                  description: log.description,
                }));
              combinedLogs.push(...userLogs);
            }
          }

          combinedLogs.sort((a, b) => compareDates(a.createdAt, b.createdAt));
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

  getFriendsAndSubscribe();

  return () => {
    unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    userDataCache.clear();
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
