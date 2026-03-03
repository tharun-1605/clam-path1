
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB2Q4ugbdSCB3CKDbRcfwyPIBcLzKTEMAE",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nero-nav.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nero-nav",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nero-nav.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "740049403553",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:740049403553:web:e753caccb8b37d44297ae0",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-YB3P1R0K4R"
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
