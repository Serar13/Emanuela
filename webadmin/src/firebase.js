import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// The Firebase web config is safe to ship in client apps; access is protected
// by Firebase Auth + Firestore security rules (see ../../site/firestore.rules).
const firebaseConfig = {
  apiKey: "AIzaSyCbYU70q82YMscOJB6f_QfjoQZEe3uHn_Q",
  authDomain: "emanuela-da572.firebaseapp.com",
  projectId: "emanuela-da572",
  storageBucket: "emanuela-da572.firebasestorage.app",
  messagingSenderId: "810957794446",
  appId: "1:810957794446:web:e2e4f0316e60e1c377eddf",
  measurementId: "G-F61DGX764D"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
