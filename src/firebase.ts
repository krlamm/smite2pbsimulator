import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAtHGfl2GwWOaNO5GlJbwYP8U10lNSnz68",
    authDomain: "smite2pbsimulator.firebaseapp.com",
    projectId: "smite2pbsimulator",
    storageBucket: "smite2pbsimulator.firebasestorage.app",
    messagingSenderId: "1019891524633",
    appId: "1:1019891524633:web:43b4556d609bed2c03f688",
    measurementId: "G-21N494VBGR"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// You can also listen to auth state changes to get the user object
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in.
    console.log("User signed in with UID:", user.uid);
  } else {
    // User is signed out.
    console.log("User is signed out.");
  }
});
