import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// my web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5hhAW_QXEoit25VlI3EmSPx6AnpeUFT0",
  authDomain: "e-commerce-application-8371b.firebaseapp.com",
  projectId: "e-commerce-application-8371b",
  storageBucket: "e-commerce-application-8371b.firebasestorage.app",
  messagingSenderId: "815971890800",
  appId: "1:815971890800:web:99eda0c64d32ba297266b5",
  measurementId: "G-3GHE6LQMLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();