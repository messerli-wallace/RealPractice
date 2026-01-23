import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import firebaseConfig from "../lib/config/firebaseConfig";

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0;

if (isFirebaseConfigured) {
  try {
    app = getApp();
  } catch {
    app = initializeApp(firebaseConfig);
  }
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
export const isConfigured = isFirebaseConfigured;
