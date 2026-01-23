import {
  collection,
  getDocs,
  query,
  where,
  DocumentSnapshot,
} from "firebase/firestore";
import { db, isConfigured } from "../firebase";
import {
  UserLogData,
  OrganizedLogEntry,
  LogEntry,
  validateLogEntry,
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

export async function getRecentPosts(name: string) {
  if (!isConfigured) {
    return [];
  }
  const allFriendData: UserLogData[] = [];
  const userdata = await getFriends(name);
  const flattenedUserData = userdata.flat();
  for (const friendName of flattenedUserData) {
    const friendData = await queryUserByName(friendName);
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
  search: string,
  retryCount = 0
): Promise<string[]> => {
  try {
    const db = getDb();
    const coll = collection(db, "users");
    const q = query(coll, where("name", "==", search));

    const targetAccounts = await getDocs(q);
    const friendsArrays: string[] = [];
    friendsArrays.push(search);
    targetAccounts.forEach((doc) => {
      const data = doc.data();
      if (Object.prototype.hasOwnProperty.call(data, "friends")) {
        friendsArrays.push(...data.friends);
      }
    });

    return friendsArrays;
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to get friends", error, {
        component: "post_feed",
        function: "getFriends",
        metadata: { search, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getFriends(search, retryCount + 1);
    }

    throw error;
  }
};

const queryUserByName = async (
  search: string,
  retryCount = 0
): Promise<UserLogData[]> => {
  try {
    const db = getDb();
    const coll = collection(db, "users");
    const q = query(coll, where("name", "==", search));

    const targetAccounts = await getDocs(q);

    return targetAccounts.docs.map((doc: DocumentSnapshot) => {
      const data = doc.data();
      if (data && data.logs) {
        return { [doc.id]: data.logs.slice(0, 10) };
      } else {
        return { [doc.id]: [] }; // Return empty array if logs are not available
      }
    });
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to query user by name", error, {
        component: "post_feed",
        function: "queryUserByName",
        metadata: { search, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return queryUserByName(search, retryCount + 1);
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
