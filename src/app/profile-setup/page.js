'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
    const router = useRouter();
    const [preferences, setPreferences] = useState({
        loudNoises: true,
        flashingLights: false,
        denseCrowds: true,
        strongSmells: false
    });

    const togglePref = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        // Here we would save to localStorage or backend
        console.log("Saved preferences:", preferences);
        router.push('/dashboard');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ marginBottom: '10px' }}>Customize Your Experience</h1>
                    <p style={{ color: 'var(--neutral-text-light)' }}>
                        Select the sensory factors that you are most sensitive to. We will prioritize avoiding these in your routes.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                    <PreferenceToggle
                        label="Loud Noises / Construction"
                        value={preferences.loudNoises}
                        onChange={() => togglePref('loudNoises')}
                        icon="🔊"
                    />
                    <PreferenceToggle
                        label="Bright or Flashing Lights"
                        value={preferences.flashingLights}
                        onChange={() => togglePref('flashingLights')}
                        icon="💡"
                    />
                    <PreferenceToggle
                        label="Dense Crowds"
                        value={preferences.denseCrowds}
                        onChange={() => togglePref('denseCrowds')}
                        icon="👥"
                    />
                    <PreferenceToggle
                        label="Strong Odors"
                        value={preferences.strongSmells}
                        onChange={() => togglePref('strongSmells')}
                        icon="👃"
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <Link href="/dashboard">
                        <button className="btn-secondary">Skip</button>
                    </Link>
                    <button className="btn-primary" onClick={handleSave}>
                        Save & Continue
                    </button>
                </div>
            </div>

        </div>
    );
}

function PreferenceToggle({ label, value, onChange, icon }) {
    return (
        <div
            onClick={onChange}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${value ? 'var(--primary-teal)' : 'var(--neutral-border)'}`,
                background: value ? 'rgba(78, 205, 196, 0.05)' : 'white',
                cursor: 'pointer', transition: 'all 0.2s ease'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '1.5rem' }}>{icon}</div>
                <div style={{ fontWeight: 600, color: value ? 'var(--primary-teal-dark)' : 'var(--neutral-text)' }}>
                    {label}
                </div>
            </div>

            <div style={{
                width: '50px', height: '28px', borderRadius: '50px',
                background: value ? 'var(--primary-teal)' : '#CBD5E0',
                position: 'relative', transition: 'background 0.3s ease'
            }}>
                <motion.div
                    initial={false}
                    animate={{ x: value ? 24 : 2 }}
                    style={{
                        width: '24px', height: '24px', background: 'white', borderRadius: '50%',
                        position: 'absolute', top: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                />
            </div>
        </div>
    )
}
