import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import { isNetworkError } from "../../lib/utils/networkUtils";
import {
  UserData,
  LogItem,
  User,
  validateUserData,
  validateLogItem,
  ErrorMetadata,
} from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";
import { updateTagAnalytics, decrementTagAnalytics } from "./tagAnalytics";

export const createData = async (
  docPath: string,
  data: UserData,
  retryCount = 0
): Promise<void> => {
  /*
   Creates a document and adds data to it. 
   Will merge an existing document with the same docPath
   */
  try {
    const docRef = doc(db, "users", docPath);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      const metadata: ErrorMetadata = {
        docPath,
        retryCount,
        component: "db",
        function: "createData",
      };
      logError("Failed to create document", error, {
        component: "db",
        function: "createData",
        metadata,
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await createData(docPath, data, retryCount + 1);
    } else {
      throw error;
    }
  }
};

export const readData = async (
  docPath: string,
  retryCount = 0
): Promise<UserData | undefined> => {
  /*
   Reads data from docPath
   https://firebase.google.com/docs/firestore/query-data/get-data?authuser=0
    */
  try {
    const docRef = doc(db, "users", docPath);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    if (validateUserData(data)) {
      return data;
    }
    return undefined;
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to read document", error, {
        component: "db",
        function: "readData",
        metadata: { docPath, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return readData(docPath, retryCount + 1);
    }
    throw error;
  }
};

export const updateData = async (
  docPath: string,
  data: Partial<UserData>,
  retryCount = 0
): Promise<void> => {
  /*
    updates the docPath document with the inputted data
    */
  try {
    const docRef = doc(db, "users", docPath);
    await updateDoc(docRef, data);
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to update document", error, {
        component: "db",
        function: "updateData",
        metadata: { docPath, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await updateData(docPath, data, retryCount + 1);
    } else {
      throw error;
    }
  }
};

export const deleteData = async (
  docPath: string,
  retryCount = 0
): Promise<void> => {
  /*
    Deletes the document at docPath
    */
  try {
    const docRef = doc(db, "users", docPath);
    await deleteDoc(docRef);
  } catch (error) {
    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await deleteData(docPath, retryCount + 1);
    } else {
      throw error;
    }
  }
};

// array methods for logs

export const addLog = async (
  docPath: string,
  newLog: LogItem,
  retryCount = 0
): Promise<void> => {
  /*
     Adds a specific log to the logs array in the docPath
     */
  if (!validateLogItem(newLog)) {
    throw new Error("Invalid log item data");
  }

  try {
    const docRef = doc(db, "users", docPath);

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);

      if (!docSnap.exists()) {
        throw new Error("User document does not exist");
      }

      const userData = docSnap.data() as UserData;
      const currentAnalytics = userData.tagAnalytics || {};

      const updatedAnalytics = updateTagAnalytics(
        currentAnalytics,
        newLog.tags
      );

      transaction.update(docRef, {
        logs: arrayUnion(newLog),
        tagAnalytics: updatedAnalytics,
      });
    });
  } catch (error) {
    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await addLog(docPath, newLog, retryCount + 1);
    } else {
      throw error;
    }
  }
};

export const removeLog = async (
  docPath: string,
  badLog: LogItem,
  retryCount = 0
): Promise<void> => {
  /*
     Deletes a specific log and decrements tag analytics
     */
  try {
    const docRef = doc(db, "users", docPath);

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);

      if (!docSnap.exists()) {
        throw new Error("User document does not exist");
      }

      const userData = docSnap.data() as UserData;
      const currentAnalytics = userData.tagAnalytics || {};

      const updatedAnalytics = decrementTagAnalytics(
        currentAnalytics,
        badLog.tags
      );

      transaction.update(docRef, {
        logs: arrayRemove(badLog),
        tagAnalytics: updatedAnalytics,
      });
    });
  } catch (error) {
    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await removeLog(docPath, badLog, retryCount + 1);
    } else {
      throw error;
    }
  }
};

// Misc functions

export const docExists = async (
  docName: string,
  user: User,
  retryCount = 0
): Promise<boolean> => {
  /**
   * Checks to see if a document exists of that name in the users collection
   * If the doc doesn't exists, this function creates it
   */
  try {
    const docRef = doc(db, "users", docName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return true;
    } else {
      await createData(user.uid, { name: user.displayName, email: user.email });
      return false;
    }
  } catch (error) {
    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return docExists(docName, user, retryCount + 1);
    }
    throw error;
  }
};

// Friend/Following functions

export const followUser = async (
  currentUserId: string,
  targetUserId: string,
  retryCount = 0
): Promise<void> => {
  /**
   * Adds targetUserId to currentUser's friends array
   * Uses arrayUnion to prevent duplicates
   */
  try {
    const docRef = doc(db, "users", currentUserId);
    await updateDoc(docRef, {
      friends: arrayUnion(targetUserId),
    });
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to follow user", error, {
        component: "db",
        function: "followUser",
        metadata: { currentUserId, targetUserId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await followUser(currentUserId, targetUserId, retryCount + 1);
    } else {
      throw error;
    }
  }
};

export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string,
  retryCount = 0
): Promise<void> => {
  /**
   * Removes targetUserId from currentUser's friends array
   * Uses arrayRemove to remove the specific user
   */
  try {
    const docRef = doc(db, "users", currentUserId);
    await updateDoc(docRef, {
      friends: arrayRemove(targetUserId),
    });
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to unfollow user", error, {
        component: "db",
        function: "unfollowUser",
        metadata: { currentUserId, targetUserId, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      await unfollowUser(currentUserId, targetUserId, retryCount + 1);
    } else {
      throw error;
    }
  }
};

export const getFriends = async (
  userId: string,
  retryCount = 0
): Promise<string[]> => {
  /**
   * Returns the friends array for a given user
   * Returns empty array if user has no friends or document doesn't exist
   */
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const validatedData = validateUserData(data);
    if (validatedData) {
      return validatedData.friends || [];
    }
    return [];
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to get friends", error, {
        component: "db",
        function: "getFriends",
        metadata: { userId, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getFriends(userId, retryCount + 1);
    }
    throw error;
  }
};

export const getUserById = async (
  userId: string,
  retryCount = 0
): Promise<UserData | null> => {
  /**
   * Returns user data for a given user ID
   * Returns null if user document doesn't exist
   */
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const validatedData = validateUserData(data);
    return validatedData;
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to get user by ID", error, {
        component: "db",
        function: "getUserById",
        metadata: { userId, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getUserById(userId, retryCount + 1);
    }
    throw error;
  }
};

export const getTagAnalytics = async (
  userId: string,
  retryCount = 0
): Promise<Record<string, number> | undefined> => {
  /**
   * Returns tag analytics for a given user ID
   * Returns undefined if user document doesn't exist or has no analytics
   */
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const validatedData = validateUserData(data);
    return validatedData?.tagAnalytics;
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to get tag analytics", error, {
        component: "db",
        function: "getTagAnalytics",
        metadata: { userId, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return getTagAnalytics(userId, retryCount + 1);
    }
    throw error;
  }
};
