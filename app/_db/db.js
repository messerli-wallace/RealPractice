import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "/app/firebase.tsx";

export const createData = async (docPath, data) => {
  /*
   Creates a document and adds data to it. 
   Will merge an existing document with the same docPath
   */
  const docRef = doc(db, "users", docPath);
  await setDoc(docRef, data, { merge: true });
};

export const readData = async (docPath) => {
  /*
   Reads data from docPath
   https://firebase.google.com/docs/firestore/query-data/get-data?authuser=0
   */
  const docRef = doc(db, "users", docPath);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
};

export const updateData = async (docPath, data) => {
  /*
   updates the docPath document with the inputted data
   */
  const docRef = doc(db, "users", docPath);
  await updateDoc(docRef, data);
};

export const deleteData = async (docPath) => {
  /*
   Deletes the document at docPath
   */
  const docRef = doc(db, "users", docPath);
  await deleteDoc(docRef);
};

// array methods for logs

export const addLog = async (docPath, newLog) => {
  /*
   Adds a specific log to the logs array in the docPath
   */
  const docRef = doc(db, "users", docPath);
  await updateDoc(docRef, {
    logs: arrayUnion(newLog),
  });
};

export const removeLog = async (docPath, badLog) => {
  /*
   Deletes a specific log
   */
  const docRef = doc(db, "users", docPath);
  await updateDoc(docRef, {
    logs: arrayRemove(badLog),
  });
};

// Misc functions

export const docExists = async (docName, user) => {
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
  }
};
