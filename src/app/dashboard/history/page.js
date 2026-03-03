'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../components/AuthContext';

const ROUTE_HISTORY_KEY = 'neuro-nav-route-history';

export default function HistoryPage() {
    const { user } = useAuth();
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        if (!user) return;
        try {
            const stored = JSON.parse(localStorage.getItem(ROUTE_HISTORY_KEY) || '[]');
            const filtered = stored.filter((item) => item.userId === user.uid || (!item.userId && item.userEmail === user.email));
            setHistoryData(filtered);
        } catch {
            setHistoryData([]);
        }
    }, [user]);

    const stats = useMemo(() => {
        const routesThisMonth = historyData.filter((item) => isInCurrentMonth(item.createdAt)).length;
        const avgScore = historyData.length > 0
            ? (historyData.reduce((sum, item) => sum + (Number(item.calmScore) || 0), 0) / historyData.length).toFixed(1)
            : '0.0';
        const totalMiles = historyData.reduce((sum, item) => sum + parseDistanceToMiles(item.distance), 0);

        return {
            routesThisMonth,
            avgScore,
            totalMiles: `${totalMiles.toFixed(1)} mi`
        };
    }, [historyData]);

    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '30px' }}>Travel History</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-teal)' }}>{stats.routesThisMonth}</div>
                    <div style={{ color: 'var(--neutral-text-light)' }}>Calm Routes This Month</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary-amber-dark)' }}>{stats.avgScore}</div>
                    <div style={{ color: 'var(--neutral-text-light)' }}>Avg Calm Score</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-coral)' }}>{stats.totalMiles}</div>
                    <div style={{ color: 'var(--neutral-text-light)' }}>Total Conscious Walking</div>
                </div>
            </div>

            {historyData.length === 0 ? (
                <div className="card" style={{ padding: '18px', color: 'var(--neutral-text-light)' }}>
                    No route history found for this account. Create a route to see your real history.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {historyData.map((item) => (
                        <motion.div
                            key={item.id}
                            className="card"
                            whileHover={{ x: 4 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', gap: '12px', flexWrap: 'wrap' }}
                        >
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)', marginBottom: '4px' }}>{formatDate(item.createdAt)}</div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.origin} {'->'} {item.destination}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, color: 'var(--primary-teal-dark)' }}>Calm Score: {Number(item.calmScore || 0).toFixed(1)}</div>
                                <div style={{ fontSize: '0.9rem' }}>{item.distance} • {item.duration}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}


function parseDistanceToMiles(distance) {
    if (!distance || typeof distance !== 'string') return 0;
    const value = parseFloat(distance);
    if (Number.isNaN(value)) return 0;
    const normalized = distance.toLowerCase();
    if (normalized.includes('km')) return value * 0.621371;
    if (normalized.includes('mi')) return value;
    return 0;
}

function isInCurrentMonth(dateValue) {
    if (!dateValue) return false;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function formatDate(dateValue) {
    if (!dateValue) return 'Unknown date';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return 'Unknown date';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
