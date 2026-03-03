
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB_VkMt50Gopzy2Tt_q3FhopVHNW0-UkW8",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smart-campus-manager.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smart-campus-manager",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smart-campus-manager.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "35838544206",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:35838544206:web:88b32b4021a69248de761f",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2P1JGMHKV2"
};

// Initialize Firebase
let app;
let auth;
let googleProvider;
let analytics;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Analytics only works in browser
    if (typeof window !== 'undefined') {
        isSupported().then((yes) => {
            if (yes) {
                analytics = getAnalytics(app);
            }
        });
    }
} catch (error) {
    console.error("Firebase init error", error);
}

export { auth, googleProvider, analytics };
