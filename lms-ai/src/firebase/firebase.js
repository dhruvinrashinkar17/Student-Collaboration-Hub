import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbxoBe5gwHnFK4g-ZoSECMZyYzjq3OY9E",
  authDomain: "student-lms-30c2c.firebaseapp.com",
  projectId: "student-lms-30c2c",
  storageBucket: "student-lms-30c2c.appspot.com",
  messagingSenderId: "793546157188",
  appId: "1:793546157188:web:aae43092a0552b0cdbe6d1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// add these two lines
export const db = getFirestore(app);
export const storage = getStorage(app);
