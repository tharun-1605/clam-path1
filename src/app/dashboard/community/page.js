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
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '10px' }}>Share Your Experience</h1>
            <p style={{ marginBottom: '40px', color: 'var(--neutral-text-light)' }}>
                Help make the map better for everyone. Your reports help us calculate real-time Calm Scores.
            </p>

            <div className="community-grid">
                {/* Visual Report Form */}
                <div className="card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                        <Plus size={22} color="var(--primary-teal)" />
                        <h2 style={{ fontSize: '1.4rem' }}>New Sensory Report</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-text-light)' }}>
                                <MapPin size={14} /> CURRENT LOCATION
                            </label>
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--neutral-bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--neutral-border)',
                                fontSize: '0.95rem'
                            }}>
                                {locationText}
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-text-light)' }}>CALM SCORE</label>
                                <span style={{
                                    fontWeight: 700,
                                    color: getScoreLabel(calmScore).color,
                                    fontSize: '0.85rem'
                                }}>
                                    {getScoreLabel(calmScore).label}
                                </span>
                            </div>
                            <input
                                type="range" min="1" max="10"
                                value={calmScore} onChange={(e) => setCalmScore(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '5px',
                                    appearance: 'none',
                                    background: `linear-gradient(to right, var(--accent-coral) 0%, var(--primary-teal) 100%)`,
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--neutral-text-light)' }}>
                                <span>Distressing</span>
                                <span>Peaceful</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-text-light)' }}>TRIGGERS PRESENT</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {triggers.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTrigger(tag)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            border: '1px solid',
                                            borderColor: selectedTriggers.includes(tag) ? 'var(--primary-teal)' : 'var(--neutral-border)',
                                            background: selectedTriggers.includes(tag) ? 'var(--primary-teal)' : 'transparent',
                                            color: selectedTriggers.includes(tag) ? 'white' : 'var(--neutral-text)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--neutral-text-light)' }}>ENVIRONMENTAL NOTES</label>
                            <textarea
                                rows="3"
                                placeholder="Describe the atmosphere..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--neutral-border)', background: 'var(--neutral-bg)' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitted}
                            style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {submitted ? <><CheckCircle size={18} /> Published!</> : <><MessageSquare size={18} /> Publish Report</>}
                        </button>
                    </form>
                </div>

                {/* Right Column: AI Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '30px', background: 'var(--dark-bg)', color: 'white', borderRadius: '24px' }}>
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
                            overflow: 'hidden',
                            marginBottom: '20px'
                        }}>
                            <VideoUpload />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', padding: '18px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '16px' }}>
                            <Info size={16} color="var(--primary-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                                Your clip is analyzed for crowd density, movement patterns, and decibel peaks. No faces or private data are ever recorded or stored.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .community-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                @media (max-width: 980px) {
                    .community-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}


