'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Simulate API call to Google Sheets
        setTimeout(() => {
            setSubmitted(false);
            setIsOpen(false);
        }, 2000);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="glass-button"
                style={{
                    width: '100%', padding: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                    border: '1px solid var(--success)'
                }}
            >
                <span>📊</span> Report Sensory Trigger
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel"
                            style={{
                                width: '400px', padding: '30px',
                                background: 'var(--card-bg)', border: '1px solid var(--primary)'
                            }}
                        >
                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                                    <h3 className="text-gradient">Report Synced!</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Data sent to Google Sheets for analysis.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>google_sheets</span> Report Issue
                                    </h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Help us map sensory triggers. This data syncs to our Google Cloud database.
                                    </p>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Trigger Type</label>
                                        <select required>
                                            <option>Loud Noise (Construction)</option>
                                            <option>Flashing Lights</option>
                                            <option>Strong Odor</option>
                                            <option>Crowd Density</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Description</label>
                                        <textarea rows="3" placeholder="Describe the environment..." required></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button type="button" onClick={() => setIsOpen(false)} className="glass-button" style={{ flex: 1 }}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                            Submit Report
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
