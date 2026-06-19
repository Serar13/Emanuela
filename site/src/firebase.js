import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbYU70q82YMscOJB6f_QfjoQZEe3uHn_Q",
  authDomain: "emanuela-da572.firebaseapp.com",
  projectId: "emanuela-da572",
  storageBucket: "emanuela-da572.firebasestorage.app",
  messagingSenderId: "810957794446",
  appId: "1:810957794446:web:f2a14a1d3be5f65d77edf",
  measurementId: "G-QLCQLW7JK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
