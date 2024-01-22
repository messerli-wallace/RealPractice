import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, remove } from "firebase/database";
import { config2 } from "/app/firebase.tsx";

const app = initializeApp(config2);
export const db = getDatabase(app);

//Read Data
export const readData = async (path) => {
    const reference = ref(db, path);
    const snapshot = await get(reference);
    return snapshot.val();
  };
//Update Data
export const updateData = async (path, data) => {
    const reference = ref(db, path);
    await update(reference, data);
  };
//Delete Data
export const deleteData = async (path) => {
    const reference = ref(db, path);
    await remove(reference);
  };
//Write Data
export const createData = async (path, data) => {
    const reference = ref(db, path);
    await set(reference, data);
  };
