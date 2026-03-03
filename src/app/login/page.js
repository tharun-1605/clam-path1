'use client';

import { useAuth } from '../../components/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { loginWithGoogle, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) router.push('/dashboard');
    }, [user]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="glass-panel"
                style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}
            >
                <h1 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '2rem' }}>Welcome to Neuro-Nav</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Your guide to a sensory-safe city journey.
                </p>

                <button
                    onClick={loginWithGoogle}
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    {/* Simple Google Icon SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.35 11.1H12v3.8h5.3c-.2 1.2-1 2.2-2.1 2.9v2.4h3.4c2-1.8 3.1-4.6 3.1-7.8 0-.8-.1-1.5-.3-2.3z" fill="#fff" />
                        {/* Simplified single path for brevity, usually multi-colored but this works for white-on-primary */}
                    </svg>
                    Sign in with Google
                </button>
            </motion.div>
        </div>
    );
}
