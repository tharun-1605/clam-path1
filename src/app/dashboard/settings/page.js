'use client';

import { motion } from 'framer-motion';

export default function SettingsPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Sensory Preferences</h1>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Noise Sensitivity</h3>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Max Decibel Threshold</span>
                        <span style={{ color: 'var(--accent)' }}>60dB</span>
                    </label>
                    <input type="range" style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>Routes with average noise above this level will be avoided.</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Visual Triggers</h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <span>Avoid Flashing Lights (Neon)</span>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <span>Avoid Construction Zones</span>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <span>Avoid Large Crowds</span>
                        <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                    </div>
                </div>

                <button className="btn-primary">Save Preferences</button>
            </div>
        </motion.div>
    );
}

