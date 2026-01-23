import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";
import { db, isConfigured } from "../firebase";
import {
  UserData,
  LogItem,
  validateUserData,
  validateLogItem,
} from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";

// Collection names for new data model
const COLLECTIONS = {
  USERS: "users",
  USER_LOGS: "userLogs",
  SOCIAL_CONNECTIONS: "socialConnections",
  LOG_INDEXES: "logIndexes",
};

function getDb(): Firestore {
  if (!isConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Please set up your Firebase credentials."
    );
  }
  return db;
}

/**
 * Helper function to check if an error is network-related
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("failed to fetch") ||
      error.message.includes("offline")
    );
  }
  return false;
}

/**
 * Create or update a user profile in the new structure
 */
export const createOrUpdateUserProfile = async (
  userId: string,
  userData: Partial<UserData>,
  retryCount = 0
): Promise<void> => {
  try {
    const db = getDb();
    const userRef = doc(db, COLLECTIONS.USERS, userId);

    const profileData = {
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
      profilePicture: userData.profilePicture,
      createdAt: userData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    };

    await setDoc(userRef, profileData, { merge: true });
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to create/update user profile", error, {
        component: "newDataModel",
        function: "createOrUpdateUserProfile",
        metadata: { userId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await createOrUpdateUserProfile(userId, userData, retryCount + 1);
    } else {
      throw error;
    }
  }
};

/**
 * Create a new log entry in the separate logs collection
 */
export const createLogEntry = async (
  logData: LogItem,
  retryCount = 0
): Promise<string> => {
  try {
    if (!validateLogItem(logData)) {
      throw new Error("Invalid log item data");
    }

    const db = getDb();
    const logsRef = collection(db, COLLECTIONS.USER_LOGS);

    const logWithTimestamps = {
      ...logData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(logsRef, logWithTimestamps);

    // Update indexes
    await updateLogIndexes(docRef.id, logData);

    return docRef.id;
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to create log entry", error, {
        component: "newDataModel",
        function: "createLogEntry",
        metadata: { logData, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return createLogEntry(logData, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Update log indexes for efficient searching
 */
const updateLogIndexes = async (
  logId: string,
  logData: LogItem
): Promise<void> => {
  try {
    const db = getDb();
    const userId = logData.userId;

    if (!userId) {
      throw new Error("Log entry missing userId");
    }

    // Index by user
    const userIndexRef = doc(db, COLLECTIONS.LOG_INDEXES, `byUser_${userId}`);
    await setDoc(
      userIndexRef,
      {
        logIds: arrayUnion(logId),
      },
      { merge: true }
    );

    // Index by tags
    if (logData.tags && logData.tags.length > 0) {
      for (const tag of logData.tags) {
        const tagIndexRef = doc(db, COLLECTIONS.LOG_INDEXES, `byTag_${tag}`);
        await setDoc(
          tagIndexRef,
          {
            logIds: arrayUnion(logId),
          },
          { merge: true }
        );
      }
    }

    // Index by date (extract date from dateTimeStr)
    const dateStr = logData.dateTimeStr.split("-").slice(0, 3).join("-");
    const dateIndexRef = doc(db, COLLECTIONS.LOG_INDEXES, `byDate_${dateStr}`);
    await setDoc(
      dateIndexRef,
      {
        logIds: arrayUnion(logId),
      },
      { merge: true }
    );
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to update log indexes", error, {
        component: "newDataModel",
        function: "updateLogIndexes",
        metadata: { logId, logData },
      });
    }
    throw error;
  }
};

/**
 * Get logs for a specific user
 */
export const getUserLogs = async (
  userId: string,
  limit: number = 10,
  retryCount = 0
): Promise<LogItem[]> => {
  try {
    const db = getDb();
    const logsQuery = query(
      collection(db, COLLECTIONS.USER_LOGS),
      where("userId", "==", userId)
      // TODO: Add proper ordering once we implement timestamps
    );

    const querySnapshot = await getDocs(logsQuery);

    const logs: LogItem[] = [];
    querySnapshot.forEach((doc) => {
      const logData = doc.data() as LogItem;
      if (validateLogItem(logData)) {
        logs.push({ ...logData, id: doc.id });
      }
    });

    return logs.slice(0, limit);
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to get user logs", error, {
        component: "newDataModel",
        function: "getUserLogs",
        metadata: { userId, limit, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getUserLogs(userId, limit, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Get logs by tag
 */
export const getLogsByTag = async (
  tag: string,
  limit: number = 10,
  retryCount = 0
): Promise<LogItem[]> => {
  try {
    const db = getDb();

    // First get the index
    const indexRef = doc(db, COLLECTIONS.LOG_INDEXES, `byTag_${tag}`);
    const indexDoc = await getDoc(indexRef);

    if (!indexDoc.exists()) {
      return [];
    }

    const indexData = indexDoc.data();
    const logIds = indexData.logIds || [];

    // Get the actual log documents
    const logs: LogItem[] = [];
    for (const logId of logIds.slice(0, limit)) {
      const logRef = doc(db, COLLECTIONS.USER_LOGS, logId);
      const logDoc = await getDoc(logRef);
      if (logDoc.exists()) {
        const logData = logDoc.data() as LogItem;
        if (validateLogItem(logData)) {
          logs.push({ ...logData, id: logDoc.id });
        }
      }
    }

    return logs;
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to get logs by tag", error, {
        component: "newDataModel",
        function: "getLogsByTag",
        metadata: { tag, limit, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getLogsByTag(tag, limit, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (
  userId: string,
  retryCount = 0
): Promise<UserData | null> => {
  try {
    const db = getDb();
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as UserData;
    if (validateUserData(userData)) {
      return userData;
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to get user profile", error, {
        component: "newDataModel",
        function: "getUserProfile",
        metadata: { userId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getUserProfile(userId, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Add friend relationship
 */
export const addFriend = async (
  userId: string,
  friendId: string,
  retryCount = 0
): Promise<void> => {
  try {
    const db = getDb();

    // Update user's friends list
    const userSocialRef = doc(db, COLLECTIONS.SOCIAL_CONNECTIONS, userId);
    await setDoc(
      userSocialRef,
      {
        friends: arrayUnion(friendId),
      },
      { merge: true }
    );

    // Update friend's friends list (bidirectional relationship)
    const friendSocialRef = doc(db, COLLECTIONS.SOCIAL_CONNECTIONS, friendId);
    await setDoc(
      friendSocialRef,
      {
        friends: arrayUnion(userId),
      },
      { merge: true }
    );
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to add friend", error, {
        component: "newDataModel",
        function: "addFriend",
        metadata: { userId, friendId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await addFriend(userId, friendId, retryCount + 1);
    } else {
      throw error;
    }
  }
};

/**
 * Get friends for a user
 */
export const getFriends = async (
  userId: string,
  retryCount = 0
): Promise<string[]> => {
  try {
    const db = getDb();
    const socialRef = doc(db, COLLECTIONS.SOCIAL_CONNECTIONS, userId);
    const socialDoc = await getDoc(socialRef);

    if (!socialDoc.exists()) {
      return [];
    }

    const socialData = socialDoc.data();
    return socialData.friends || [];
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to get friends", error, {
        component: "newDataModel",
        function: "getFriends",
        metadata: { userId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getFriends(userId, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Backward compatibility wrapper for existing functions
 */
export const addLogWithFallback = async (
  userId: string,
  newLog: LogItem,
  retryCount = 0
): Promise<void> => {
  try {
    // Try new structure first
    const logWithUserId = { ...newLog, userId };
    await createLogEntry(logWithUserId);
  } catch (error) {
    if (error instanceof Error) {
      logError("New data model failed, falling back to old structure", error, {
        component: "newDataModel",
        function: "addLogWithFallback",
      });
    }

    // Fallback to old structure
    try {
      const oldDb = getDb();
      const docRef = doc(oldDb, "users", userId);
      await updateDoc(docRef, {
        logs: arrayUnion(newLog),
      });
    } catch (fallbackError) {
      if (retryCount < 3 && isNetworkError(fallbackError)) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
        await addLogWithFallback(userId, newLog, retryCount + 1);
      } else {
        throw fallbackError;
      }
    }
  }
};
