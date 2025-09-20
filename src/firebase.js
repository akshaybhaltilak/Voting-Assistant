import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDWwDrtCP_2eRemm5l_KIpLEXJUIdYm3E8",
  authDomain: "chatbot-49a9d.firebaseapp.com",
  projectId: "chatbot-49a9d",
  storageBucket: "chatbot-49a9d.firebasestorage.app",
  messagingSenderId: "134767840490",
  appId: "1:134767840490:web:b6c90c1e964bd9a7f75b93",
  measurementId: "G-6SQZCNQB6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore Database
export const db = getFirestore(app);

// Storage (for file uploads)
export const storage = getStorage(app);
export const auth = getAuth(app);

// ==============================================
// EXAMPLE USAGE IN YOUR COMPONENTS:
// ==============================================
//
// 1. Import the db in your component file:
//    import { db } from './path/to/this/file';
//
// 2. Import your askGemini function:
//    import { askGemini } from './path/to/your-gemini-file';
//
// 3. Use it in your component:
//    const handleUserInput = async (input) => {
//      const response = await askGemini(input, db);
//      console.log(response);
//      return response;
//    };
//
// ==============================================