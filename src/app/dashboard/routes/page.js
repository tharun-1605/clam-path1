'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { getCommunityCalmStatsNear } from '../../../lib/communityReports';

const ROUTE_HISTORY_KEY = 'neuro-nav-route-history';
const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];

export default function RoutesPage() {
    const { user } = useAuth();
    const [originMode, setOriginMode] = useState('manual');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [route, setRoute] = useState(null);
    const [locating, setLocating] = useState(false);
    const [currentOrigin, setCurrentOrigin] = useState({
        label: '',
        lat: null,
        lon: null,
        error: ''
    });

    const saveRouteToHistory = (entry) => {
        try {
            const current = JSON.parse(localStorage.getItem(ROUTE_HISTORY_KEY) || '[]');
            const next = [entry, ...current].slice(0, 100);
            localStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify(next));
        } catch (err) {
            console.error('Failed to save route history:', err);
        }
    };

    const detectCurrentLocation = () => {
        if (!navigator.geolocation) {
            setCurrentOrigin((prev) => ({ ...prev, error: 'Geolocation is not supported in this browser.' }));
            return;
        }

        setLocating(true);
        setCurrentOrigin((prev) => ({ ...prev, error: '' }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const label = await reverseGeocode(lat, lon);
                setCurrentOrigin({ label, lat, lon, error: '' });
                setLocating(false);
            },
            () => {
                setCurrentOrigin((prev) => ({
                    ...prev,
                    error: 'Could not fetch current location. Please allow location permission.'
                }));
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if ((!origin && originMode === 'manual') || !destination) return;

        setLoading(true);
        setRoute(null);

        try {
            let coords1;
            let startLabel;

            if (originMode === 'current') {
                if (currentOrigin.lat == null || currentOrigin.lon == null) {
                    throw new Error('Current location is not available yet. Please allow location access.');
                }
                coords1 = { lat: currentOrigin.lat, lon: currentOrigin.lon };
                startLabel = currentOrigin.label || `${Number(currentOrigin.lat).toFixed(4)}, ${Number(currentOrigin.lon).toFixed(4)}`;
            } else {
                coords1 = await getCoordinates(origin);
                if (!coords1) throw new Error(`Could not find location: ${origin}`);
                startLabel = origin.trim();
            }

            const coords2 = await getCoordinates(destination);
            if (!coords2) throw new Error(`Could not find location: ${destination}`);

            const stats = await getRouteStats(coords1, coords2);

            const nextRoute = {
                duration: stats.duration,
                distance: stats.distance,
                noiseLevel: stats.noiseLevel,
                calmScore: stats.calmScore,
                description: `A sensory-safe route from ${startLabel} to ${destination}. Real-time data fetched via OSRM${stats.communityCount ? ` + ${stats.communityCount} nearby community reports` : ''}.`
            };

            setRoute(nextRoute);
            saveRouteToHistory({
                id: Date.now(),
                createdAt: new Date().toISOString(),
                userId: user?.uid || null,
                userEmail: user?.email || null,
                origin: startLabel,
                destination: destination.trim(),
                duration: nextRoute.duration,
                distance: nextRoute.distance,
                calmScore: nextRoute.calmScore
            });
        } catch (err) {
            console.error('Routing Error:', err);
            const fallbackRoute = {
                duration: 'Calculated',
                distance: 'Unknown',
                noiseLevel: 'Estimated (50 dB)',
                calmScore: 6.0,
                description: `Could not fetch exact stats (${err.message}). Showing map path.`
            };
            setRoute(fallbackRoute);
            saveRouteToHistory({
                id: Date.now(),
                createdAt: new Date().toISOString(),
                userId: user?.uid || null,
                userEmail: user?.email || null,
                origin: originMode === 'current' ? (currentOrigin.label || 'Current Location') : origin.trim(),
                destination: destination.trim(),
                duration: fallbackRoute.duration,
                distance: fallbackRoute.distance,
                calmScore: fallbackRoute.calmScore
            });
        } finally {
            setLoading(false);
        }
    };

    async function reverseGeocode(lat, lon) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=14&addressdetails=1`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('reverse geocode failed');
            const data = await res.json();
            const address = data?.address || {};
            return (
                address.suburb ||
                address.neighbourhood ||
                address.city_district ||
                address.city ||
                address.town ||
                address.village ||
                data?.display_name?.split(',')?.[0]?.trim() ||
                `${lat.toFixed(4)}, ${lon.toFixed(4)}`
            );
        } catch {
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    }

    async function getCoordinates(address) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
            return null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function getRouteStats(c1, c2) {
        try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${c1.lon},${c1.lat};${c2.lon},${c2.lat}?overview=full&geometries=geojson`);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                const r = data.routes[0];
                const distKm = (r.distance / 1000).toFixed(1);
                const durMin = Math.round(r.duration / 60);
                const hours = Math.floor(durMin / 60);
                const mins = durMin % 60;
                const noiseLevel = await estimateNoiseLevel(r, Number(distKm));
                return {
                    distance: `${distKm} km`,
                    duration: hours > 0 ? `${hours}h ${mins}m` : `${mins} min`,
                    noiseLevel: noiseLevel.label,
                    calmScore: noiseLevel.calmScore,
                    communityCount: noiseLevel.communityCount
                };
            }
        } catch (e) {
            console.error(e);
        }
        return { distance: 'Unknown', duration: 'Unknown', noiseLevel: 'Estimated (50 dB)', calmScore: 6.0, communityCount: 0 };
    }

    async function estimateNoiseLevel(routeObj, distKm) {
        let db = 38 + (distKm * 0.6);

        try {
            const points = routeObj?.geometry?.coordinates || [];
            if (points.length > 0) {
                const mid = points[Math.floor(points.length / 2)];
                const midLon = mid[0];
                const midLat = mid[1];

                const query = `
                    [out:json][timeout:10];
                    (
                      way["highway"~"motorway|trunk|primary|secondary"](around:900,${midLat},${midLon});
                      way["railway"](around:900,${midLat},${midLon});
                      node["amenity"~"bus_station|fuel|marketplace"](around:900,${midLat},${midLon});
                    );
                    out tags 60;
                `;

                let elements = [];
                for (const server of OVERPASS_SERVERS) {
                    try {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), 5000);
                        const response = await fetch(server, { method: 'POST', body: query, signal: controller.signal });
                        clearTimeout(timeout);
                        if (!response.ok) continue;
                        const data = await response.json();
                        elements = data?.elements || [];
                        if (elements.length) break;
                    } catch {
                        // try next server
                    }
                }

                if (elements.length) {
                    let majorRoads = 0;
                    let rail = 0;
                    let transportNodes = 0;

                    for (const el of elements) {
                        const tags = el?.tags || {};
                        if (tags.highway) majorRoads += 1;
                        if (tags.railway) rail += 1;
                        if (tags.amenity === 'bus_station' || tags.amenity === 'fuel' || tags.amenity === 'marketplace') {
                            transportNodes += 1;
                        }
                    }

                    db += Math.min(majorRoads, 12) * 1.4;
                    db += Math.min(rail, 4) * 2.2;
                    db += Math.min(transportNodes, 10) * 0.7;
                }
            }
        } catch {
            // fallback to base estimate
        }

        if (routeObj?.geometry?.coordinates?.length > 0) {
            const mid = routeObj.geometry.coordinates[Math.floor(routeObj.geometry.coordinates.length / 2)];
            const community = getCommunityCalmStatsNear(mid[1], mid[0], 2.5);
            if (community.count > 0) {
                // Low community calm raises expected dB, high calm lowers it.
                db += (5 - community.avgCalm) * 2.1;
                const boundedWithCommunity = Math.max(35, Math.min(78, db));
                const roundedWithCommunity = Math.round(boundedWithCommunity);
                const calmScore = Number(Math.max(1, Math.min(10, (10 - ((roundedWithCommunity - 35) / 4.3)) + ((community.avgCalm - 5) * 0.15))).toFixed(1));
                if (roundedWithCommunity <= 45) return { label: `Quiet (${roundedWithCommunity} dB)`, calmScore, communityCount: community.count };
                if (roundedWithCommunity <= 58) return { label: `Moderate (${roundedWithCommunity} dB)`, calmScore, communityCount: community.count };
                return { label: `Busy (${roundedWithCommunity} dB)`, calmScore, communityCount: community.count };
            }
        }

        const bounded = Math.max(35, Math.min(78, db));
        const rounded = Math.round(bounded);
        const calmScore = Number(Math.max(1, Math.min(10, 10 - ((rounded - 35) / 4.3))).toFixed(1));
        if (rounded <= 45) return { label: `Quiet (${rounded} dB)`, calmScore, communityCount: 0 };
        if (rounded <= 58) return { label: `Moderate (${rounded} dB)`, calmScore, communityCount: 0 };
        return { label: `Busy (${rounded} dB)`, calmScore, communityCount: 0 };
    }

    useEffect(() => {
        if (originMode === 'current' && (currentOrigin.lat == null || currentOrigin.lon == null) && !locating) {
            detectCurrentLocation();
        }
    }, [originMode]); // eslint-disable-line react-hooks/exhaustive-deps

    const startForMaps = originMode === 'current' && currentOrigin.lat != null && currentOrigin.lon != null
        ? `${currentOrigin.lat},${currentOrigin.lon}`
        : origin;

    return (
        <div className="routes-grid">
            <motion.div
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
                <h1 className="text-gradient" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
                    Quiet Route Planner
                </h1>

                <div className="glass-panel" style={{ padding: '1.1rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--neutral-text-light)' }}>Start Option</label>
                            <select value={originMode} onChange={(e) => setOriginMode(e.target.value)}>
                                <option value="manual">Enter Manually</option>
                                <option value="current">Use Current Location</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--neutral-text-light)' }}>Start Location</label>
                            <input
                                type="text"
                                onChange={(e) => setOrigin(e.target.value)}
                                value={originMode === 'current' ? (locating ? 'Detecting your location...' : (currentOrigin.label || 'Current location not detected')) : origin}
                                placeholder={originMode === 'current' ? 'Current Location' : 'e.g. Coimbatore'}
                                disabled={originMode === 'current'}
                            />
                            {originMode === 'current' && currentOrigin.error && (
                                <div style={{ marginTop: '6px', fontSize: '.82rem', color: 'var(--accent-coral-dark)' }}>{currentOrigin.error}</div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--neutral-text-light)' }}>Destination</label>
                            <input
                                type="text"
                                onChange={(e) => setDestination(e.target.value)}
                                value={destination}
                                placeholder="e.g. Madurai"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Analyzing Route...' : 'Find Quiet Route'}
                        </button>
                    </form>
                </div>

                {route && !loading && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-panel"
                        style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}
                    >
                        <h3 style={{ marginBottom: '.9rem', color: 'var(--success)' }}>Route Optimized</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.8rem', marginBottom: '.9rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Est. Time</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{route.duration}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Distance</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{route.distance}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Avg Noise</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{route.noiseLevel}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Calm Score</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{Number(route.calmScore || 0).toFixed(1)}</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--foreground)', fontSize: '.88rem' }}>{route.description}</p>
                    </motion.div>
                )}
            </motion.div>

            <div className="glass-panel map-panel">
                <div className="map-stage">
                    <div className="tech-grid"></div>
                    {loading ? (
                        <div style={{ textAlign: 'center', zIndex: 10 }}>
                            <div className="spinner"></div>
                            <h3 className="text-gradient">Analyzing Acoustic Data...</h3>
                        </div>
                    ) : route ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?saddr=${encodeURIComponent(startForMaps)}&daddr=${encodeURIComponent(destination)}&output=embed`}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>

                            <div className="map-actions">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startForMaps)}&destination=${encodeURIComponent(destination)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                >
                                    Open Full Map
                                </a>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this sensory-safe route from ${startForMaps} to ${destination}: https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startForMaps)}&destination=${encodeURIComponent(destination)}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    Share
                                </a>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        const msg = new SpeechSynthesisUtterance(`Starting quiet route from ${startForMaps} to ${destination}. This path is optimized for low noise levels.`);
                                        window.speechSynthesis.speak(msg);
                                    }}
                                >
                                    Speak
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', zIndex: 10, opacity: 0.78 }}>
                            <h3 style={{ color: 'var(--text-muted)' }}>Enter locations to generate path</h3>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .routes-grid {
                    display: grid;
                    grid-template-columns: minmax(280px, 390px) minmax(0, 1fr);
                    gap: 14px;
                    min-height: 100%;
                }

                .map-panel {
                    overflow: hidden;
                    min-height: 500px;
                    padding: 0;
                    border-radius: 22px;
                }

                .map-stage {
                    width: 100%;
                    height: 100%;
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: radial-gradient(circle at center, #1a2740 0%, #0a1222 100%);
                }

                .tech-grid {
                    position: absolute;
                    inset: 0;
                    opacity: 0.1;
                    background-image: linear-gradient(#39c8c8 1px, transparent 1px), linear-gradient(90deg, #39c8c8 1px, transparent 1px);
                    background-size: 32px 32px;
                }

                .spinner {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    border: 4px solid #39c8c8;
                    border-top-color: transparent;
                    animation: spin 0.9s linear infinite;
                    margin: 0 auto 16px;
                }

                .map-actions {
                    position: absolute;
                    left: 50%;
                    bottom: 12px;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 0 10px;
                }

                @media (max-width: 1100px) {
                    .routes-grid {
                        grid-template-columns: 1fr;
                    }

                    .map-panel,
                    .map-stage {
                        min-height: 420px;
                    }
                }

                @media (max-width: 680px) {
                    .map-panel,
                    .map-stage {
                        min-height: 320px;
                    }

                    .map-actions {
                        position: static;
                        transform: none;
                        padding: 12px;
                        margin-top: -2px;
                        background: linear-gradient(to top, rgba(7, 14, 27, 0.82), rgba(7, 14, 27, 0.15));
                    }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
