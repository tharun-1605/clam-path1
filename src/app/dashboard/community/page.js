'use client';

import { useEffect, useState } from 'react';
import VideoUpload from '../../../components/VideoUpload';

export default function CommunityPage() {
    const [calmScore, setCalmScore] = useState(5);
    const [notes, setNotes] = useState('');
    const [locationText, setLocationText] = useState('Detecting current location...');

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationText('Current Location: Unavailable');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const label = await reverseGeocode(latitude, longitude);
                setLocationText(`Current Location: ${label}`);
            },
            () => {
                setLocationText('Current Location: Permission denied');
            },
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
            const label =
                address.road ||
                address.neighbourhood ||
                address.suburb ||
                address.city_district ||
                address.city ||
                address.town ||
                address.village;

            if (label) return label;
        } catch {
            // use coordinate fallback
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Report Submitted! Thank you for contributing.');
    };

    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '10px' }}>Share Your Experience</h1>
            <p style={{ marginBottom: '40px', color: 'var(--neutral-text-light)' }}>
                Help make the map better for everyone. Your reports help us calculate real-time Calm Scores.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* Visual Report Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Location</label>
                            <input type="text" value={locationText} readOnly />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                                How calm is this area right now? (1-10)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span>😰 (1)</span>
                                <input
                                    type="range" min="1" max="10"
                                    value={calmScore} onChange={(e) => setCalmScore(e.target.value)}
                                    style={{ flex: 1, accentColor: 'var(--primary-teal)' }}
                                />
                                <span>(10) 😌</span>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                                Score: {calmScore}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Triggers Present</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {['Loud Noises', 'Bright Lights', 'Crowds', 'Construction'].map(tag => (
                                    <label key={tag} style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '8px 12px', background: 'var(--neutral-bg)', borderRadius: '20px',
                                        cursor: 'pointer', border: '1px solid var(--neutral-border)'
                                    }}>
                                        <input type="checkbox" /> {tag}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Notes</label>
                            <textarea
                                rows="3"
                                placeholder="Any additional details..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                            Submit Report
                        </button>
                    </form>
                </div>

                {/* Video Upload Section */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📸 Upload Scene Video</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)' }}>
                            Record a 10-second clips of the environment. Our AI will analyze noise levels and crowd density anonymously.
                        </p>
                    </div>
                    <VideoUpload />
                </div>

            </div>
        </div>
    );
}
