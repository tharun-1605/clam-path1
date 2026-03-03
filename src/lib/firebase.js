
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB_VkMt50Gopzy2Tt_q3FhopVHNW0-UkW8",
    authDomain: "smart-campus-manager.firebaseapp.com",
    projectId: "smart-campus-manager",
    storageBucket: "smart-campus-manager.firebasestorage.app",
    messagingSenderId: "35838544206",
    appId: "1:35838544206:web:88b32b4021a69248de761f",
    measurementId: "G-2P1JGMHKV2"
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
