import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { bigboy } from "../../firebaseconfig.js"; // not needed on release

const config = bigboy; //change to actual config on firebase push.
// Initialize Firebase
export const app = initializeApp(config);

export const db = getFirestore(app);

export const auth = getAuth(app);
