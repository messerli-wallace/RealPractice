import {
  collection,
  getDocs,
  query,
  where,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, isConfigured } from "../firebase";
import {
  UserLogData,
  OrganizedLogEntry,
  LogEntry,
  validateLogEntry,
  UserData,
} from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";

function getDb() {
  if (!isConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Please set up your Firebase credentials."
    );
  }
  return db;
}

export async function getRecentLogs(userId: string) {
  if (!isConfigured || !userId) {
    return [];
  }
  const allFriendData: UserLogData[] = [];
  const userdata = await getFriends(userId);
  const flattenedUserIds = userdata.flat();
  for (const friendId of flattenedUserIds) {
    const friendData = await queryUserById(friendId);
    allFriendData.push(...friendData);
  }

  const sortedData = organizeAndSortData(allFriendData);
  return sortedData;
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

const getFriends = async (
  userId: string,
  retryCount = 0
): Promise<string[]> => {
  try {
    const db = getDb();
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    const userDocData = userDoc.data();
    const friendsArrays: string[] = [];
    friendsArrays.push(userId);
    if (
      userDocData &&
      Object.prototype.hasOwnProperty.call(userDocData, "friends")
    ) {
      friendsArrays.push(...userDocData.friends);
    }

    return friendsArrays;
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to get friends", error, {
        component: "log_feed",
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

const queryUserById = async (
  userId: string,
  retryCount = 0
): Promise<UserLogData[]> => {
  try {
    const db = getDb();
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return [];
    }

    const data = userDoc.data() as UserData;
    const userName = data?.name || userId;

    if (!data || !data.logs) {
      return [{ [userName]: [] }];
    }
    return [{ [userName]: data.logs }];
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to query user by id", error, {
        component: "log_feed",
        function: "queryUserById",
        metadata: { userId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return queryUserById(userId, retryCount + 1);
    }

    throw error;
  }
};

function organizeAndSortData(userData: UserLogData[]): OrganizedLogEntry[] {
  // Flatten and organize the data into the desired format
  const organizedData: OrganizedLogEntry[] = [];

  userData.forEach((user) => {
    const userKeys = Object.keys(user);
    const userName = userKeys[0];

    user[userName].forEach((activity: LogEntry) => {
      // Validate each log entry before processing
      if (validateLogEntry(activity)) {
        const { dateTimeStr, duration, tags, description } = activity;
        organizedData.push({
          user: userName,
          dateTimeStr,
          duration,
          tags,
          description,
        });
      } else {
        console.warn("Invalid log entry skipped:", activity);
      }
    });
  });

  // Sort the organized data by dateTimeStr
  organizedData.sort((a, b) => {
    return Number(a.dateTimeStr) - Number(b.dateTimeStr);
  });

  return organizedData;
}
