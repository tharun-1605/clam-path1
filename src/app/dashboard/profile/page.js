'use client';

import { useAuth } from '../../../components/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [preferences, setPreferences] = useState({
        soundSensitivity: 80, // 0-100
        lightSensitivity: 60,
        crowdToerance: 40
    });

    const handleSave = () => {
        setIsEditing(false);
        // Here we would sync with backend
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}
        >
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    width: '120px', height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    margin: '0 auto 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', fontWeight: 'bold', color: 'white',
                    border: '4px solid rgba(255,255,255,0.1)'
                }}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                        user?.displayName ? user.displayName[0] : 'U'
                    )}
                </div>

                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    {user?.displayName || 'Neuro-Nav User'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {user?.email || 'user@example.com'}
                </p>
            </div>

            {/* Sensory Preferences Section */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary-teal)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--primary)', margin: 0 }}>Sensory Preferences</h3>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={isEditing ? "btn-primary" : "glass-button"}
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                        {isEditing ? 'Save Changes' : 'Edit Preferences'}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Sound */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontWeight: 600, color: 'var(--foreground)' }}>Sound Sensitivity</label>
                            <span style={{ color: 'var(--primary-teal)', fontWeight: 700 }}>
                                {preferences.soundSensitivity > 70 ? 'High' : preferences.soundSensitivity > 30 ? 'Medium' : 'Low'}
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="range" min="0" max="100"
                                value={preferences.soundSensitivity}
                                onChange={(e) => setPreferences({ ...preferences, soundSensitivity: parseInt(e.target.value) })}
                                style={{ width: '100%', accentColor: 'var(--primary-teal)' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${preferences.soundSensitivity}%`, height: '100%', background: 'var(--primary-teal)' }}></div>
                            </div>
                        )}
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Affects routing noise avoidance and quiet place recommendations.
                        </p>
                    </div>

                    {/* Light */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontWeight: 600, color: 'var(--foreground)' }}>Light Sensitivity</label>
                            <span style={{ color: 'var(--secondary-lavender)', fontWeight: 700 }}>
                                {preferences.lightSensitivity > 70 ? 'High' : preferences.lightSensitivity > 30 ? 'Medium' : 'Low'}
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="range" min="0" max="100"
                                value={preferences.lightSensitivity}
                                onChange={(e) => setPreferences({ ...preferences, lightSensitivity: parseInt(e.target.value) })}
                                style={{ width: '100%', accentColor: 'var(--secondary-lavender)' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${preferences.lightSensitivity}%`, height: '100%', background: 'var(--secondary-lavender)' }}></div>
                            </div>
                        )}
                    </div>

                    {/* Crowd */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontWeight: 600, color: 'var(--foreground)' }}>Crowd Tolerance</label>
                            <span style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>
                                {preferences.crowdToerance > 70 ? 'High' : preferences.crowdToerance > 30 ? 'Medium' : 'Low'}
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="range" min="0" max="100"
                                value={preferences.crowdToerance}
                                onChange={(e) => setPreferences({ ...preferences, crowdToerance: parseInt(e.target.value) })}
                                style={{ width: '100%', accentColor: 'var(--accent-coral)' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${preferences.crowdToerance}%`, height: '100%', background: 'var(--accent-coral)' }}></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quiet Miles</h3>
                    <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>42</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Safe Havens</h3>
                    <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>12</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Contributions</h3>
                    <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>5</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Recent Travel History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { from: 'Coimbatore', to: 'Madurai', date: 'Dec 31, 2024', noise: '42dB (Quiet)' },
                        { from: 'Gandhipuram', to: 'RS Puram', date: 'Dec 30, 2024', noise: '45dB (Moderate)' },
                        { from: 'Town Hall', to: 'Ukkadam', date: 'Dec 28, 2024', noise: '55dB (Loud - Avoided)' },
                    ].map((trip, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px', background: 'var(--background)', borderRadius: '8px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{trip.from} ➝ {trip.to}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trip.date}</div>
                            </div>
                            <span style={{
                                fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px',
                                background: trip.noise.includes('Quiet') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                                color: trip.noise.includes('Quiet') ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {trip.noise}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Account Actions</h3>
                <button className="glass-button" style={{ width: '100%', padding: '15px', textAlign: 'left', marginBottom: '10px' }}>
                    Export Sensory Data
                </button>
                <button className="glass-button" style={{ width: '100%', padding: '15px', textAlign: 'left', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    Delete Account
                </button>
            </div>
        </motion.div>
    );
}
