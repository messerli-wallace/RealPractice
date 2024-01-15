// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQIQM98n6wuY-bPhh_Rdj5oTrHAdJT-H8",
  authDomain: "focus-ensign-410701.firebaseapp.com",
  databaseURL: "https://focus-ensign-410701-default-rtdb.firebaseio.com",
  projectId: "focus-ensign-410701",
  storageBucket: "focus-ensign-410701.appspot.com",
  messagingSenderId: "935894316426",
  appId: "1:935894316426:web:ae8e9bf19cddf509694473",
  measurementId: "G-9RSPP8HSER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // not supported in this environment, apparently. Will probably have to wrap in something idk

export const auth = getAuth(app);
