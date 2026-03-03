'use client';

import { motion } from 'framer-motion';

const historyData = [
    { id: 1, date: "Dec 30, 2025", route: "Home → Grocery Store", score: 8.5, distance: "1.2 mi", duration: "18 min" },
    { id: 2, date: "Dec 28, 2025", route: "Office → Central Park", score: 9.2, distance: "0.8 mi", duration: "12 min" },
    { id: 3, date: "Dec 25, 2025", route: "Home → Parents' House", score: 7.8, distance: "3.5 mi", duration: "45 min" },
];

export default function HistoryPage() {
    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '30px' }}>Travel History</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-teal)' }}>12</div>
                    <div style={{ color: 'var(--neutral-text-light)' }}>Calm Routes This Month</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--secondary-lavender)' }}>8.1</div>
                    <div style={{ color: 'var(--neutral-text-light)' }}>Avg Calm Score</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-coral)' }}>18mi</div>
                    <div style={{ color: 'var(--neutral-text-light)' }}>Total Conscious Walking</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {historyData.map((item) => (
                    <motion.div
                        key={item.id}
                        className="card"
                        whileHover={{ x: 5 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}
                    >
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)', marginBottom: '5px' }}>{item.date}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{item.route}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--primary-teal-dark)' }}>Calm Score: {item.score}</div>
                            <div style={{ fontSize: '0.9rem' }}>{item.distance} • {item.duration}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

