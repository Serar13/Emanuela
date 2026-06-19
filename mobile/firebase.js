import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbYU70q82YMscOJB6f_QfjoQZEe3uHn_Q",
  authDomain: "emanuela-da572.firebaseapp.com",
  projectId: "emanuela-da572",
  storageBucket: "emanuela-da572.firebasestorage.app",
  messagingSenderId: "810957794446",
  appId: "1:810957794446:web:f2a14a1d3be5f65d77edf"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize or retrieve Auth instance
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

// Export Firestore
export const db = getFirestore(app);
export const storage = getStorage(app);

export { auth };
export default app;
