'use client';

import { useAuth } from '../../../components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    User,
    Settings,
    History,
    Shield,
    Volume2,
    Sun,
    Users,
    LogOut,
    Download,
    Trash2,
    ChevronRight,
    Award,
    MapPin
} from 'lucide-react';

// --- Shared Styles & Constants ---
const colors = {
    primary: '#4ECDC4',
    primaryDark: '#3AABA3',
    secondary: '#B8A8D6',
    accent: '#FF6B6B',
    success: '#6FCF97',
    bg: '#F7F7F7',
    card: '#FFFFFF',
    text: '#2D3748',
    textLight: '#718096',
    border: '#E0E0E0',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)'
};

const glassPanelStyle = {
    background: colors.glassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: '20px',
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)'
};

const btnPrimaryStyle = {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
};

const btnSecondaryStyle = {
    background: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text,
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [preferences, setPreferences] = useState({
        soundSensitivity: 80,
        lightSensitivity: 60,
        crowdTolerance: 40
    });

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            minHeight: '100%'
        }}>
            <div style={{ maxWidth: '1000px', width: '100%', padding: '20px', paddingBottom: '60px' }}>

                {/* --- Premium Header Section --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        ...glassPanelStyle,
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        marginBottom: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}
                >
                    {/* Decorative background element */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        background: `linear-gradient(135deg, ${colors.primary}22, ${colors.secondary}22)`,
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                        zIndex: 0
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            background: 'white',
                            padding: '5px',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                            border: `2px solid ${colors.primary}44`
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={60} color="white" />
                                )}
                            </div>
                        </div>

                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>
                            {user?.displayName || 'Traveler'}
                        </h1>
                        <p style={{ color: colors.textLight, fontSize: '1.1rem', marginBottom: '24px' }}>
                            {user?.email || 'member since 2024'}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <div style={{
                                background: `${colors.primary}15`,
                                color: colors.primaryDark,
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Award size={14} /> Elite Navigator
                            </div>
                            <div style={{
                                background: `${colors.secondary}15`,
                                color: '#7C3AED',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Shield size={14} /> Verified Member
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- Navigation Tabs --- */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px',
                    background: 'rgba(0,0,0,0.03)',
                    padding: '6px',
                    borderRadius: '16px',
                    width: 'fit-content',
                    margin: '0 auto 30px'
                }}>
                    {[
                        { id: 'overview', icon: <User size={18} />, label: 'Overview' },
                        { id: 'sensory', icon: <Volume2 size={18} />, label: 'Sensory Profile' },
                        { id: 'history', icon: <History size={18} />, label: 'Travel History' },
                        { id: 'settings', icon: <Settings size={18} />, label: 'Account' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                color: activeTab === tab.id ? colors.primaryDark : colors.textLight,
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- Tab Content Area --- */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ ...glassPanelStyle, padding: '30px', height: '100%' }}>
                                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Award style={{ color: colors.primary }} /> Progress Summary
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                            <StatCard label="Quiet Miles" value="1,284" subtext="+12% this month" color={colors.primary} />
                                            <StatCard label="Calm Score" value="8.4" subtext="Personal average" color={colors.secondary} />
                                            <StatCard label="Communities" value="12" subtext="Groups joined" color={colors.accent} />
                                        </div>
                                        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(78, 205, 196, 0.05)', borderRadius: '16px' }}>
                                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: colors.text }}>
                                                <strong>Pro Tip:</strong> You've avoided 45dB+ noise levels on 80% of your routes this week. Your sensory stress levels are down by 15% based on your check-ins.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ ...glassPanelStyle, padding: '30px' }}>
                                        <h3 style={{ marginBottom: '20px' }}>Quick Bio</h3>
                                        <p style={{ color: colors.textLight, lineHeight: 1.6, fontSize: '0.95rem' }}>
                                            Passionate about exploring city landscapes without the sensory overload. Always looking for the quietest coffee shops and hidden parks.
                                        </p>
                                        <hr style={{ margin: '20px 0', border: 'none', borderTop: `1px solid ${colors.border}` }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span style={{ color: colors.textLight }}>Location</span>
                                                <span style={{ fontWeight: 600 }}>New York, NY</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span style={{ color: colors.textLight }}>Member Since</span>
                                                <span style={{ fontWeight: 600 }}>Jan 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sensory' && (
                            <div style={{ ...glassPanelStyle, padding: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Sensory Preferences</h3>
                                        <p style={{ color: colors.textLight }}>Customize how Neuro-Nav calculates your calmest routes.</p>
                                    </div>
                                    <button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        style={{
                                            ...btnPrimaryStyle,
                                            background: isEditing ? colors.success : btnPrimaryStyle.background
                                        }}
                                    >
                                        {isEditing ? 'Save Profile' : 'Edit Preferences'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    <SensoryControl
                                        icon={<Volume2 style={{ color: colors.primary }} />}
                                        label="Sound Sensitivity"
                                        value={preferences.soundSensitivity}
                                        color={colors.primary}
                                        isEditing={isEditing}
                                        onChange={(val) => setPreferences({ ...preferences, soundSensitivity: val })}
                                        desc="Controls tolerance for construction, sirens, and busy intersections."
                                    />
                                    <SensoryControl
                                        icon={<Sun style={{ color: colors.secondary }} />}
                                        label="Light Sensitivity"
                                        value={preferences.lightSensitivity}
                                        color={colors.secondary}
                                        isEditing={isEditing}
                                        onChange={(val) => setPreferences({ ...preferences, lightSensitivity: val })}
                                        desc="Adjusts for flashing signs, bright sun, and harsh artificial lighting."
                                    />
                                    <SensoryControl
                                        icon={<Users style={{ color: colors.accent }} />}
                                        label="Crowd Tolerance"
                                        value={preferences.crowdTolerance}
                                        color={colors.accent}
                                        isEditing={isEditing}
                                        onChange={(val) => setPreferences({ ...preferences, crowdTolerance: val })}
                                        desc="Determines routes through side streets vs. main thoroughfares."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div style={{ ...glassPanelStyle, padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '1.5rem' }}>Recent Journeys</h3>
                                    <button style={{ background: 'transparent', border: 'none', color: colors.primaryDark, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        View Detailed Calendar <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { from: 'Central Park', to: 'Metropolitan Museum', date: 'Oct 12, 2024', duration: '15m', calm: '9.2', status: 'Optimal' },
                                        { from: 'SoHo', to: 'Brooklyn Bridge', date: 'Oct 10, 2024', duration: '45m', calm: '7.8', status: 'Detoured' },
                                        { from: 'Chelsea Market', to: 'The High Line', date: 'Oct 08, 2024', duration: '20m', calm: '8.5', status: 'Optimal' },
                                        { from: 'Times Square Area', to: 'Bryant Park', date: 'Oct 05, 2024', duration: '12m', calm: '6.4', status: 'High Stress' }
                                    ].map((trip, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '20px',
                                            background: 'white',
                                            borderRadius: '16px',
                                            border: `1px solid ${colors.border}`,
                                            transition: 'transform 0.2s ease',
                                            cursor: 'pointer'
                                        }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: `${colors.primary}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginRight: '20px', color: colors.primaryDark
                                            }}>
                                                <MapPin size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                                                    {trip.from} <span style={{ color: colors.textLight, fontWeight: 400 }}>→</span> {trip.to}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: colors.textLight }}>
                                                    {trip.date} • {trip.duration} travel time
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: colors.textLight, letterSpacing: '0.5px' }}>Calm Score</div>
                                                    <div style={{ fontWeight: 800, color: colors.primaryDark }}>{trip.calm}</div>
                                                </div>
                                                <div style={{
                                                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                                    background: trip.status === 'Optimal' ? `${colors.success}15` : trip.status === 'Detoured' ? `${colors.secondary}15` : `${colors.accent}15`,
                                                    color: trip.status === 'Optimal' ? '#059669' : trip.status === 'Detoured' ? '#7C3AED' : '#DC2626',
                                                    minWidth: '80px', textAlign: 'center'
                                                }}>
                                                    {trip.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ ...glassPanelStyle, padding: '30px' }}>
                                    <h3 style={{ marginBottom: '20px' }}>Security & Access</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <SettingsItem icon={<Shield size={18} />} label="Change Password" />
                                        <SettingsItem icon={<MapPin size={18} />} label="Location Privacy" toggle />
                                        <SettingsItem icon={<Download size={18} />} label="Data Portability" />
                                    </div>
                                </div>
                                <div style={{ ...glassPanelStyle, padding: '30px' }}>
                                    <h3 style={{ marginBottom: '20px', color: colors.accent }}>Danger Zone</h3>
                                    <p style={{ color: colors.textLight, fontSize: '0.9rem', marginBottom: '20px' }}>
                                        Once you delete your account or sign out, your sensory history may be difficult to recover.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button
                                            onClick={logout}
                                            style={{ ...btnSecondaryStyle, width: '100%', justifyContent: 'flex-start' }}
                                        >
                                            <LogOut size={18} /> Sign Out of Neuro-Nav
                                        </button>
                                        <button style={{
                                            ...btnSecondaryStyle,
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            color: colors.accent,
                                            borderColor: `${colors.accent}33`
                                        }}>
                                            <Trash2 size={18} /> Delete Account Permanently
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Helper Components ---

function StatCard({ label, value, subtext, color }) {
    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
            <div style={{ fontSize: '0.85rem', color: colors.textLight, marginBottom: '8px', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.text, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: color, fontWeight: 700 }}>{subtext}</div>
        </div>
    );
}

function SensoryControl({ icon, label, value, color, desc, isEditing, onChange }) {
    return (
        <div style={{ padding: '24px', background: 'white', borderRadius: '16px', border: `1px solid #E0E0E0`, transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', color: colors.textLight }}>{desc}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: color }}>
                        {value > 70 ? 'High' : value > 30 ? 'Moderate' : 'Low'}
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: isEditing ? 'visible' : 'hidden' }}>
                {isEditing ? (
                    <input
                        type="range"
                        min="0" max="100"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '100%',
                            appearance: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            accentColor: color,
                            zIndex: 2
                        }}
                    />
                ) : (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        style={{ height: '100%', background: color, borderRadius: '4px' }}
                    />
                )}
            </div>
        </div>
    );
}

function SettingsItem({ icon, label, toggle }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
            cursor: 'pointer'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '0.95rem' }}>
                <span style={{ color: colors.textLight }}>{icon}</span>
                {label}
            </div>
            {toggle ? (
                <div style={{ width: '40px', height: '20px', background: colors.primary, borderRadius: '10px', position: 'relative' }}>
                    <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }} />
                </div>
            ) : (
                <ChevronRight size={18} color={colors.textLight} />
            )}
        </div>
    );
}

