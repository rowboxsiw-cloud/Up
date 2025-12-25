
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC-t_vB6OujhQfAHuMoC9VgybEIl8IaAsA",
  authDomain: "whatsapp-like-app-cabcf.firebaseapp.com",
  databaseURL: "https://whatsapp-like-app-cabcf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whatsapp-like-app-cabcf",
  storageBucket: "whatsapp-like-app-cabcf.firebasestorage.app",
  messagingSenderId: "427607724769",
  appId: "1:427607724769:web:982a7d4a24d329c0ca1da0",
  measurementId: "G-NXC7QE1MFR"
};

// Initialize Firebase services using modular SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
