'use client';

import { useEffect, useState } from 'react';
import VideoUpload from '../../../components/VideoUpload';
import { useAuth } from '../../../components/AuthContext';
import { loadCommunityReports, saveCommunityReport } from '../../../lib/communityReports';

const TRIGGER_OPTIONS = ['Loud Noises', 'Bright Lights', 'Crowds', 'Construction'];

export default function CommunityPage() {
    const { user } = useAuth();
    const [calmScore, setCalmScore] = useState(5);
    const [notes, setNotes] = useState('');
    const [triggers, setTriggers] = useState([]);
    const [locationText, setLocationText] = useState('Detecting current location...');
    const [coords, setCoords] = useState({ lat: null, lon: null });
    const [statusMsg, setStatusMsg] = useState('');
    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationText('Current Location: Unavailable');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lon: longitude });
                const label = await reverseGeocode(latitude, longitude);
                setLocationText(`Current Location: ${label}`);
            },
            () => {
                setLocationText('Current Location: Permission denied');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );

        const all = loadCommunityReports();
        setRecentReports(all.slice(0, 6));
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
            // fallback to coordinates
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    };

    const toggleTrigger = (tag) => {
        setTriggers((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (coords.lat == null || coords.lon == null) {
            setStatusMsg('Location unavailable. Allow location access and try again.');
            return;
        }

        const report = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            userId: user?.uid || null,
            userEmail: user?.email || null,
            locationLabel: locationText.replace('Current Location: ', ''),
            lat: coords.lat,
            lon: coords.lon,
            calmScore: Number(calmScore),
            triggers,
            notes: notes.trim()
        };

        saveCommunityReport(report);
        setRecentReports(loadCommunityReports().slice(0, 6));
        setNotes('');
        setTriggers([]);
        setStatusMsg('Report submitted and added to live map analysis.');
    };

    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '10px' }}>Share Your Experience</h1>
            <p style={{ marginBottom: '24px', color: 'var(--neutral-text-light)' }}>
                Reports from this page are used in Live Map analysis and route calm path estimation.
            </p>

            <div className="community-grid">
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
                                <span>(1)</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={calmScore}
                                    onChange={(e) => setCalmScore(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: 'var(--primary-teal)' }}
                                />
                                <span>(10)</span>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                                Score: {calmScore}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Triggers Present</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {TRIGGER_OPTIONS.map((tag) => (
                                    <label
                                        key={tag}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            background: 'var(--neutral-bg)',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            border: '1px solid var(--neutral-border)'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={triggers.includes(tag)}
                                            onChange={() => toggleTrigger(tag)}
                                        />
                                        {tag}
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
                        {statusMsg && (
                            <div style={{ fontSize: '.9rem', color: 'var(--primary-teal-dark)' }}>{statusMsg}</div>
                        )}
                    </form>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Upload Scene Video</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)' }}>
                                Video helps improve contextual analysis with your text report.
                            </p>
                        </div>
                        <VideoUpload />
                    </div>

                    <div className="glass-panel" style={{ padding: '18px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Recent Community Reports</h3>
                        {recentReports.length === 0 ? (
                            <p style={{ color: 'var(--neutral-text-light)' }}>No reports yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {recentReports.map((item) => (
                                    <div key={item.id} className="card" style={{ padding: '10px' }}>
                                        <div style={{ fontSize: '.9rem', fontWeight: 700 }}>{item.locationLabel}</div>
                                        <div style={{ fontSize: '.82rem', color: 'var(--neutral-text-light)' }}>
                                            Calm {Number(item.calmScore || 0).toFixed(1)} / 10
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .community-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 18px;
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
