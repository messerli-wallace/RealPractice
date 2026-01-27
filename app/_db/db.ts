import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
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
    await updateDoc(docRef, {
      logs: arrayUnion(newLog),
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
    Deletes a specific log
    */
  try {
    const docRef = doc(db, "users", docPath);
    await updateDoc(docRef, {
      logs: arrayRemove(badLog),
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
