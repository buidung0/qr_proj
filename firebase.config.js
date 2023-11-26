// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCo2k_SyjOSOpxaaiWlCJvEn0CIEl23JCk",
  authDomain: "qr-atentdance.firebaseapp.com",
  projectId: "qr-atentdance",
  storageBucket: "qr-atentdance.appspot.com",
  messagingSenderId: "285780628611",
  appId: "1:285780628611:web:51200a989bc0fd535fb7b6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
