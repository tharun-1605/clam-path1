'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, CheckCircle, Activity, ShieldCheck, Video, MessageSquare, Plus } from 'lucide-react';
import VideoUpload from '../../../components/VideoUpload';

export default function CommunityPage() {
    const [calmScore, setCalmScore] = useState(5);
    const [notes, setNotes] = useState('');
    const [locationText, setLocationText] = useState('Detecting current location...');
    const [selectedTriggers, setSelectedTriggers] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const triggers = ['Loud Noises', 'Bright Lights', 'Crowds', 'Construction', 'Unpleasant Smells', 'Fast Movement'];

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationText('Location Unavailable');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const label = await reverseGeocode(latitude, longitude);
                setLocationText(label);
            },
            () => setLocationText('Permission denied'),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    }, []);

    const reverseGeocode = async (lat, lng) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=16&addressdetails=1`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('reverse geocode failed');
            const data = await response.json();
            const address = data?.address || {};
            return address.road || address.neighbourhood || address.suburb || address.city || 'Current Location';
        } catch {
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    };

    const toggleTrigger = (trigger) => {
        setSelectedTriggers(prev =>
            prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    const getScoreLabel = (score) => {
        // Using HEX values so they can be combined with opacity strings
        if (score <= 3) return { label: 'Overstimulating', color: '#FF6B6B' }; // Accent Coral
        if (score <= 6) return { label: 'Manageable', color: '#F6AD55' };
        return { label: 'Perfectly Calm', color: '#4ECDC4' }; // Primary Teal
    };

    return (
        <div className="container-max" style={{ padding: '40px 20px', minHeight: '100vh' }}>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
            >
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px' }}>
                    Community Intelligence
                </h1>
                <p style={{ color: 'var(--neutral-text-light)', fontSize: '1.1rem' }}>
                    Contribute to the real-time sensory map and help your fellow navigators find peace.
                </p>
            </motion.header>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {[
                    { label: 'Active Contributions', value: '1,284', icon: <Activity size={20} />, color: 'var(--primary-teal)' },
                    { label: 'Safe Havens Verified', value: '42', icon: <ShieldCheck size={20} />, color: '#B8A8D6' },
                    { label: 'Community Trust Score', value: '98%', icon: <CheckCircle size={20} />, color: 'var(--success-green)' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel"
                        style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}
                    >
                        <div style={{
                            padding: '12px',
                            background: `${stat.color}20`,
                            borderRadius: '12px',
                            color: stat.color
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--neutral-text-light)', fontWeight: 500 }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'start' }}>

                {/* Left: Report Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ padding: '35px', background: 'var(--neutral-card)', borderRadius: '24px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                        <Plus size={24} color="var(--primary-teal)" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>New Sensory Report</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                                <MapPin size={16} color="var(--primary-teal)" />
                                CURRENT LOCATION
                            </label>
                            <div className="glass-panel" style={{
                                padding: '14px 20px',
                                background: 'var(--neutral-bg)',
                                border: '1px solid var(--neutral-border)',
                                color: locationText.includes('Detecting') ? 'var(--neutral-text-light)' : 'var(--neutral-text)',
                                borderRadius: '14px',
                                fontWeight: 500
                            }}>
                                {locationText}
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>CALM SCORE</label>
                                <span style={{
                                    fontWeight: 700,
                                    color: getScoreLabel(calmScore).color,
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: `${getScoreLabel(calmScore).color}15`,
                                    fontSize: '0.85rem'
                                }}>
                                    {getScoreLabel(calmScore).label}
                                </span>
                            </div>
                            <input
                                type="range" min="1" max="10"
                                value={calmScore} onChange={(e) => setCalmScore(parseInt(e.target.value))}
                                style={{
                                    height: '8px',
                                    borderRadius: '5px',
                                    appearance: 'none',
                                    background: `linear-gradient(to right, var(--accent-coral) 0%, var(--primary-teal) 100%)`,
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', color: 'var(--neutral-text-light)' }}>
                                <span>Distressing (1)</span>
                                <span>Peaceful (10)</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 600, fontSize: '0.9rem' }}>TRIGGERS PRESENT</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {triggers.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTrigger(tag)}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            border: '1px solid',
                                            borderColor: selectedTriggers.includes(tag) ? 'var(--primary-teal)' : 'var(--neutral-border)',
                                            background: selectedTriggers.includes(tag) ? 'var(--primary-teal)' : 'transparent',
                                            color: selectedTriggers.includes(tag) ? 'white' : 'var(--neutral-text)',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '0.9rem' }}>ENVIRONMENTAL NOTES</label>
                            <textarea
                                rows="3"
                                placeholder="Describe the atmosphere..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ borderRadius: '16px', background: 'var(--neutral-bg)', border: '2px solid var(--neutral-border)' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitted}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '1rem',
                                background: submitted ? 'var(--success-green)' : 'linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {submitted ? (
                                <><CheckCircle size={20} /> Reported Successfully!</>
                            ) : (
                                <><MessageSquare size={20} /> Publish Report</>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Right: AI Analysis & Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* AI Video Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel"
                        style={{ padding: '30px', background: 'var(--dark-bg)', color: 'white' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                <Video color="var(--primary-teal)" size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>AI Scene Analysis</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>Analyze sensory stress via video pulse</p>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            overflow: 'hidden'
                        }}>
                            <VideoUpload />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '15px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '12px', border: '1px solid rgba(78, 205, 196, 0.2)' }}>
                            <Info size={16} color="var(--primary-teal)" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                                Your clip is analyzed for crowd density and decibel peaks. No faces or private data are ever stored.
                            </p>
                        </div>
                    </motion.div>

                    {/* Activity Feed Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                        style={{ border: 'none', background: 'transparent', padding: '0' }}
                    >
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={18} color="var(--primary-teal)" />
                            RECENT ACTIVITY
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { user: 'Sarah M.', location: 'Brookfield Library', action: 'Verified Safe Haven', time: '2m ago' },
                                { user: 'Alex P.', location: 'Central Station', action: 'Reported High Crowds', time: '15m ago' },
                                { user: 'Jamie L.', location: 'Botanical Gardens', action: 'Updated Calm Level', time: '1h ago' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid var(--neutral-border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.user}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--neutral-text-light)' }}>
                                            {item.action} @ {item.location}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-text-light)' }}>{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: white;
                    border: 4px solid var(--primary-teal);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    transition: transform 0.1s ease;
                }
                input[type='range']::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}


