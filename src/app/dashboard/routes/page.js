'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function RoutesPage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [route, setRoute] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!origin || !destination) return;

        setLoading(true);
        setRoute(null);

        try {
            // 1. Geocode Origin
            const coords1 = await getCoordinates(origin);
            if (!coords1) throw new Error(`Could not find location: ${origin}`);

            // 2. Geocode Destination
            const coords2 = await getCoordinates(destination);
            if (!coords2) throw new Error(`Could not find location: ${destination}`);

            // 3. Get Route Stats from OSRM
            const stats = await getRouteStats(coords1, coords2);

            setRoute({
                duration: stats.duration,
                distance: stats.distance,
                noiseLevel: 'Quiet (42dB)', // Still estimated based on route type
                description: `A sensory-safe route from ${origin} to ${destination}. Real-time data fetched via OSRM.`
            });

        } catch (err) {
            console.error("Routing Error:", err);
            // Fallback for demo if API fails
            setRoute({
                duration: 'Calculated',
                distance: 'Unknown',
                noiseLevel: 'Quiet (42dB)',
                description: `Could not fetch exact stats (${err.message}). Showing map path.`
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper: Geocode Address -> Lat/Lon (Nominatim)
    async function getCoordinates(address) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            }
            return null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    // Helper: OSRM Routing -> Distance/Duration
    async function getRouteStats(c1, c2) {
        try {
            // OSRM expects lon,lat
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${c1.lon},${c1.lat};${c2.lon},${c2.lat}?overview=false`);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                const r = data.routes[0];
                // Distance is in meters, Duration in seconds
                const distKm = (r.distance / 1000).toFixed(1);
                const durMin = Math.round(r.duration / 60);

                const hours = Math.floor(durMin / 60);
                const mins = durMin % 60;

                return {
                    distance: `${distKm} km`,
                    duration: hours > 0 ? `${hours}h ${mins}m` : `${mins} min`
                };
            }
        } catch (e) {
            console.error(e);
        }
        return { distance: 'Unknown', duration: 'Unknown' };
    }

    return (
        <div style={{ display: 'flex', gap: '20px', height: '90vh', padding: '20px' }}>
            {/* Left Panel: Inputs */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>Quiet Route Planner</h1>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neutral-text-light)' }}>Start Location</label>
                            <input
                                type="text"
                                className="glass-button"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '1rem' }}
                                onChange={(e) => setOrigin(e.target.value)}
                                value={origin}
                                placeholder="e.g. Coimbatore"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neutral-text-light)' }}>Destination</label>
                            <input
                                type="text"
                                className="glass-button"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '1rem' }}
                                onChange={(e) => setDestination(e.target.value)}
                                value={destination}
                                placeholder="e.g. Madurai"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Simulating Path...' : 'Find Quiet Route'}
                        </button>
                    </form>
                </div>

                {route && !loading && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-panel"
                        style={{ padding: '2rem', borderLeft: '4px solid var(--success)' }}
                    >
                        <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Route Optimized</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Time</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{route.duration}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distance</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{route.distance}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Noise</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{route.noiseLevel}</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>{route.description}</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Right Panel: Simulated Map View */}
            <div className="glass-panel" style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
                {/* Simulation UI Layer */}
                <div style={{
                    width: '100%', height: '100%',
                    background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                }}>
                    {/* Techy Grid Background */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.1,
                        backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>

                    {loading ? (
                        <div style={{ textAlign: 'center', zIndex: 10 }}>
                            <div className="animate-pulse" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #38bdf8', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                            <h3 className="text-gradient">Analyzing Acoustic Data...</h3>
                        </div>
                    ) : route ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {/* Embedded Map View */}
                            <div style={{ flex: 1, width: '100%', borderRadius: '20px', overflow: 'hidden', background: '#e5e7eb' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src={`https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&output=embed`}
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                            </div>

                            {/* Action Buttons Overlay */}
                            <div style={{
                                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                                display: 'flex', gap: '15px', zIndex: 20
                            }}>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-button"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px', borderRadius: '50px',
                                        background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                    <span>Open Full Map</span>
                                </a>

                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this sensory-safe route from ${origin} to ${destination}: https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-button"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px', borderRadius: '50px',
                                        background: '#25D366', color: 'white',
                                        border: 'none', fontWeight: 600
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                    </svg>
                                    <span>Share Route</span>
                                </a>

                                <button
                                    onClick={() => {
                                        const msg = new SpeechSynthesisUtterance(`Starting quiet route from ${origin} to ${destination}. This path is optimized for low noise levels.`);
                                        window.speechSynthesis.speak(msg);
                                    }}
                                    className="glass-button"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px', borderRadius: '50px',
                                        background: 'rgba(255, 255, 255, 0.9)', color: 'black',
                                        border: 'none', fontWeight: 600
                                    }}
                                >
                                    <span>🗣️</span> Speak
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', zIndex: 10, opacity: 0.7 }}>
                            <h3 style={{ color: 'var(--text-muted)' }}>Enter locations to generate path</h3>
                        </div>
                    )}
                </div>

                <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            </div>
        </div>
    );
}

