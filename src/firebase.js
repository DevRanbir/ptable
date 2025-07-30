// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4_LUIiPZBoYqldbIvFjZCoclRT-Zt_6I",
  authDomain: "speechviber.firebaseapp.com",
  databaseURL: "https://speechviber-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "speechviber",
  storageBucket: "speechviber.firebasestorage.app",
  messagingSenderId: "360160284654",
  appId: "1:360160284654:web:3d4a4031065eefeee888ff",
  measurementId: "G-FJVD7KXJC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
