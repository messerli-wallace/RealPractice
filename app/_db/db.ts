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

interface UserData {
  name?: string | null;
  logs?: LogItem[];
  friends?: string[];
  [key: string]: unknown;
}

interface LogItem {
  dateTimeStr: string;
  duration: string;
  description: string;
  tags: string[];
  [key: string]: unknown;
}

export const createData = async (
  docPath: string,
  data: UserData
): Promise<void> => {
  /*
   Creates a document and adds data to it. 
   Will merge an existing document with the same docPath
   */
  const docRef = doc(db, "users", docPath);
  await setDoc(docRef, data, { merge: true });
};

export const readData = async (
  docPath: string
): Promise<UserData | undefined> => {
  /*
   Reads data from docPath
   https://firebase.google.com/docs/firestore/query-data/get-data?authuser=0
   */
  const docRef = doc(db, "users", docPath);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as UserData | undefined;
};

export const updateData = async (
  docPath: string,
  data: Partial<UserData>
): Promise<void> => {
  /*
   updates the docPath document with the inputted data
   */
  const docRef = doc(db, "users", docPath);
  await updateDoc(docRef, data);
};

export const deleteData = async (docPath: string): Promise<void> => {
  /*
   Deletes the document at docPath
   */
  const docRef = doc(db, "users", docPath);
  await deleteDoc(docRef);
};

// array methods for logs

export const addLog = async (
  docPath: string,
  newLog: LogItem
): Promise<void> => {
  /*
   Adds a specific log to the logs array in the docPath
   */
  const docRef = doc(db, "users", docPath);
  await updateDoc(docRef, {
    logs: arrayUnion(newLog),
  });
};

export const removeLog = async (
  docPath: string,
  badLog: LogItem
): Promise<void> => {
  /*
   Deletes a specific log
   */
  const docRef = doc(db, "users", docPath);
  await updateDoc(docRef, {
    logs: arrayRemove(badLog),
  });
};

// Misc functions

interface User {
  uid: string;
  displayName: string | null;
}

export const docExists = async (
  docName: string,
  user: User
): Promise<boolean> => {
  /**
   * Checks to see if a document exists of that name in the users collection
   * If the doc doesn't exists, this function creates it
   */
  const docRef = doc(db, "users", docName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return true;
  } else {
    createData(user.uid, { name: user.displayName });
    return false;
  }
};
