'use client';

import { motion } from 'framer-motion';

export default function CalmScoreHeader({ score = 7.2, location = "Downtown Area" }) {
    // Determine color based on score
    const getColor = (s) => {
        if (s >= 7) return 'var(--success-green)';
        if (s >= 4) return 'var(--warning-yellow)';
        return 'var(--accent-coral)';
    };

    const color = getColor(score);

    return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--neutral-text-light)', fontWeight: 500 }}>Current Location</h2>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{location}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Area Calm Score
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            fontSize: '2.5rem', fontWeight: 800,
                            color: color, textShadow: `0 0 20px ${color}40`
                        }}
                    >
                        {score}
                    </motion.div>
                    <div style={{ fontSize: '1rem', color: 'var(--neutral-text-light)', marginTop: '10px' }}>/ 10</div>
                </div>
            </div>
        </div>
    );
}
