'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../components/AuthContext';
import {
    User,
    Settings,
    History,
    Volume2,
    Sun,
    Users,
    LogOut,
    Download,
    Trash2,
    Shield,
    MapPin
} from 'lucide-react';

const ROUTE_HISTORY_KEY = 'neuro-nav-route-history';

const defaultPreferences = {
    soundSensitivity: 80,
    lightSensitivity: 60,
    crowdTolerance: 40
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!user) return;

        try {
            const raw = JSON.parse(localStorage.getItem(ROUTE_HISTORY_KEY) || '[]');
            const filtered = raw.filter((item) => item.userId === user.uid || (!item.userId && item.userEmail === user.email));
            setHistory(filtered);
        } catch {
            setHistory([]);
        }

        try {
            const saved = JSON.parse(localStorage.getItem(`neuro-nav-preferences:${user.uid}`) || 'null');
            if (saved) setPreferences(saved);
        } catch {
            setPreferences(defaultPreferences);
        }
    }, [user]);

    const stats = useMemo(() => {
        const totalMiles = history.reduce((sum, item) => sum + parseDistanceToMiles(item.distance), 0);
        const avgCalmScore = history.length
            ? (history.reduce((sum, item) => sum + (Number(item.calmScore) || 0), 0) / history.length).toFixed(1)
            : '0.0';
        const thisMonthRoutes = history.filter((item) => isInCurrentMonth(item.createdAt)).length;
        return {
            totalMiles: totalMiles.toFixed(1),
            avgCalmScore,
            thisMonthRoutes
        };
    }, [history]);

    const memberSince = useMemo(() => {
        const date = user?.metadata?.creationTime;
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }, [user?.metadata?.creationTime]);

    const savePreferences = () => {
        if (!user) return;
        localStorage.setItem(`neuro-nav-preferences:${user.uid}`, JSON.stringify(preferences));
        setIsEditing(false);
    };

    return (
        <div className="container-max" style={{ padding: '18px 6px 30px 6px' }}>
            <div className="glass-panel" style={{ padding: '22px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-teal), var(--secondary-amber))',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User color="white" size={28} />
                        )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800 }}>{user?.displayName || 'Traveler'}</h1>
                        <p style={{ color: 'var(--neutral-text-light)' }}>{user?.email || 'No email available'}</p>
                        <p style={{ color: 'var(--neutral-text-light)', fontSize: '.9rem' }}>Member since {memberSince}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {[
                    { id: 'overview', icon: <User size={16} />, label: 'Overview' },
                    { id: 'sensory', icon: <Volume2 size={16} />, label: 'Sensory Profile' },
                    { id: 'history', icon: <History size={16} />, label: 'Travel History' },
                    { id: 'settings', icon: <Settings size={16} />, label: 'Account' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '8px 12px' }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                >
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <StatCard label="Quiet Miles" value={stats.totalMiles} subtext="From your routes" />
                            <StatCard label="Avg Calm Score" value={stats.avgCalmScore} subtext="Your personal average" />
                            <StatCard label="Routes This Month" value={`${stats.thisMonthRoutes}`} subtext="Saved route plans" />
                        </div>
                    )}

                    {activeTab === 'sensory' && (
                        <div className="glass-panel" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                <h3>Sensory Preferences</h3>
                                <button className="btn-primary" onClick={() => (isEditing ? savePreferences() : setIsEditing(true))}>
                                    {isEditing ? 'Save' : 'Edit'}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <PreferenceRow
                                    icon={<Volume2 size={16} />}
                                    label="Sound Sensitivity"
                                    value={preferences.soundSensitivity}
                                    isEditing={isEditing}
                                    onChange={(val) => setPreferences({ ...preferences, soundSensitivity: val })}
                                />
                                <PreferenceRow
                                    icon={<Sun size={16} />}
                                    label="Light Sensitivity"
                                    value={preferences.lightSensitivity}
                                    isEditing={isEditing}
                                    onChange={(val) => setPreferences({ ...preferences, lightSensitivity: val })}
                                />
                                <PreferenceRow
                                    icon={<Users size={16} />}
                                    label="Crowd Tolerance"
                                    value={preferences.crowdTolerance}
                                    isEditing={isEditing}
                                    onChange={(val) => setPreferences({ ...preferences, crowdTolerance: val })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="glass-panel" style={{ padding: '16px' }}>
                            <h3 style={{ marginBottom: '12px' }}>Your Recent Journeys</h3>
                            {history.length === 0 ? (
                                <p style={{ color: 'var(--neutral-text-light)' }}>No route history found for this account.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {history.map((trip) => {
                                        const status = getStatus(Number(trip.calmScore || 0));
                                        return (
                                            <div key={trip.id} className="card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(0, 168, 168, 0.12)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <MapPin size={16} color="var(--primary-teal-dark)" />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {trip.origin} {'->'} {trip.destination}
                                                    </div>
                                                    <div style={{ fontSize: '.85rem', color: 'var(--neutral-text-light)' }}>
                                                        {formatDate(trip.createdAt)} • {trip.distance} • {trip.duration}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--primary-teal-dark)' }}>
                                                        {Number(trip.calmScore || 0).toFixed(1)}
                                                    </div>
                                                    <div style={{ fontSize: '.75rem', color: statusColor(status) }}>{status}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                            <div className="glass-panel" style={{ padding: '16px' }}>
                                <h3 style={{ marginBottom: '10px' }}>Security & Access</h3>
                                <SettingsItem icon={<Shield size={16} />} label="Account Protection" />
                                <SettingsItem icon={<MapPin size={16} />} label="Location Privacy" />
                                <SettingsItem icon={<Download size={16} />} label="Data Portability" />
                            </div>
                            <div className="glass-panel" style={{ padding: '16px' }}>
                                <h3 style={{ marginBottom: '10px', color: 'var(--accent-coral-dark)' }}>Danger Zone</h3>
                                <button className="btn-secondary" onClick={logout} style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}>
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-coral-dark)' }}>
                                    <Trash2 size={16} />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, subtext }) {
    return (
        <div className="card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '.82rem', color: 'var(--neutral-text-light)', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--primary-teal-dark)' }}>{subtext}</div>
        </div>
    );
}

function PreferenceRow({ icon, label, value, isEditing, onChange }) {
    return (
        <div className="card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    {icon}
                    {label}
                </div>
                <div style={{ color: 'var(--primary-teal-dark)', fontWeight: 700 }}>{value}</div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                disabled={!isEditing}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}

function SettingsItem({ icon, label }) {
    return (
        <div className="card" style={{ padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            {icon}
            {label}
        </div>
    );
}

function parseDistanceToMiles(distance) {
    if (!distance || typeof distance !== 'string') return 0;
    const value = parseFloat(distance);
    if (Number.isNaN(value)) return 0;
    const d = distance.toLowerCase();
    if (d.includes('km')) return value * 0.621371;
    if (d.includes('mi')) return value;
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

function getStatus(score) {
    if (score >= 8) return 'Optimal';
    if (score >= 6) return 'Moderate';
    return 'High Stress';
}

function statusColor(status) {
    if (status === 'Optimal') return '#059669';
    if (status === 'Moderate') return '#7C3AED';
    return '#DC2626';
}
