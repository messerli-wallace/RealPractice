import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { bigboy } from "../../firebaseconfig.js"; // not needed on release

const config = bigboy; //change to actual config on firebase push.

// Initialize Firebase
export const app = initializeApp(config);
// const analytics = getAnalytics(app); // not supported in this environment, apparently. Will probably have to wrap in something idk

export const db = getFirestore(app);

export const auth = getAuth(app);
