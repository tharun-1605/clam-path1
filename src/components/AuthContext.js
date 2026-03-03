'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                // Persist session if needed (Firebase does this automatically mostly)
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            setAuthError('');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake loading for UX
            await signInWithPopup(auth, googleProvider);
            router.push('/dashboard');
        } catch (error) {
            console.error("Login Failed", error);
            if (error?.code === 'auth/unauthorized-domain') {
                const host = typeof window !== 'undefined' ? window.location.hostname : 'current host';
                setAuthError(`Google login is blocked for this domain (${host}). Add it to Firebase Authentication > Settings > Authorized domains.`);
            } else if (error?.code === 'auth/popup-closed-by-user') {
                setAuthError('Login popup was closed before completing sign in.');
            } else {
                setAuthError(error?.message || 'Login failed. Please try again.');
            }
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Logout Failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading, authError }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
