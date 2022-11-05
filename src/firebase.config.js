// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKIAicTezjJGle8l1qgmtKo6xZA5BKGK0",
  authDomain: "house-marketplace-app-23a9a.firebaseapp.com",
  projectId: "house-marketplace-app-23a9a",
  storageBucket: "house-marketplace-app-23a9a.appspot.com",
  messagingSenderId: "936575911934",
  appId: "1:936575911934:web:5cb753eafdf52a004ba2af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export
export const db = getFirestore()