'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { getCommunityCalmStatsNear, getLoudWarningsNear } from '../../../lib/communityReports';

const ROUTE_HISTORY_KEY = 'neuro-nav-route-history';
const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];

const DEFAULT_PREFS = {
    soundSensitivity: 80,
    lightSensitivity: 60,
    crowdTolerance: 40
};

export default function RoutesPage() {
    const { user } = useAuth();
    const [originMode, setOriginMode] = useState('manual');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [route, setRoute] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [historicalAvgDb, setHistoricalAvgDb] = useState(52);
    const [locating, setLocating] = useState(false);
    const [currentOrigin, setCurrentOrigin] = useState({
        label: '',
        lat: null,
        lon: null,
        error: ''
    });
    const [preferences, setPreferences] = useState(DEFAULT_PREFS);

    useEffect(() => {
        if (!user?.uid) return;
        try {
            const saved = JSON.parse(localStorage.getItem(`neuro-nav-preferences:${user.uid}`) || 'null');
            if (saved) setPreferences(saved);
        } catch {
            setPreferences(DEFAULT_PREFS);
        }
    }, [user?.uid]);

    useEffect(() => {
        loadHistoricalNoise();
    }, []);

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
        setAlternatives([]);

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

            const scoredRoutes = await getSensoryRoutes(coords1, coords2, preferences, historicalAvgDb);
            if (!scoredRoutes.length) throw new Error('No routes available');

            const best = scoredRoutes[0];
            const nextRoute = {
                duration: best.durationLabel,
                distance: best.distanceLabel,
                noiseLevel: best.noiseLabel,
                calmScore: best.calmScore,
                sensoryRisk: best.sensoryRisk,
                routeIndex: best.routeIndex,
                description: `Lowest sensory-impact path selected from ${scoredRoutes.length} options using historical noise, real-time context, community alerts, and your sensory profile.`
            };

            setRoute(nextRoute);
            setAlternatives(scoredRoutes.slice(1, 4));

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
                sensoryRisk: 50,
                routeIndex: 1,
                description: `Could not compute full sensory routing (${err.message}).`
            };
            setRoute(fallbackRoute);
            setAlternatives([]);
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

    async function loadHistoricalNoise() {
        try {
            const res = await fetch('/api/sensory-data', { cache: 'no-store' });
            if (!res.ok) return;
            const payload = await res.json();
            const rows = payload?.data || [];
            const values = rows.map((r) => Number(r.decibel)).filter((v) => Number.isFinite(v));
            if (values.length) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                setHistoricalAvgDb(Number(avg.toFixed(1)));
            }
        } catch {
            // keep default
        }
    }

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
            if (data && data.length > 0) return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
            return null;
        } catch {
            return null;
        }
    }

    async function getSensoryRoutes(c1, c2, prefs, historicalDb) {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${c1.lon},${c1.lat};${c2.lon},${c2.lat}?overview=full&geometries=geojson&alternatives=true&steps=false`);
        const data = await res.json();
        const routes = data?.routes || [];
        if (!routes.length) return [];

        const scored = [];
        for (let i = 0; i < routes.length; i += 1) {
            const routeObj = routes[i];
            const summary = await scoreRoute(routeObj, i + 1, prefs, historicalDb);
            scored.push(summary);
        }

        return scored.sort((a, b) => a.sensoryRisk - b.sensoryRisk);
    }

    async function scoreRoute(routeObj, routeIndex, prefs, historicalDb) {
        const distanceKm = routeObj.distance / 1000;
        const durationMin = Math.max(1, Math.round(routeObj.duration / 60));
        const hours = Math.floor(durationMin / 60);
        const mins = durationMin % 60;

        const points = routeObj?.geometry?.coordinates || [];
        const samplePoints = pickSamplePoints(points);
        const realtime = await getRealtimeContext(samplePoints);

        const communityStats = samplePoints.length
            ? getCommunityCalmStatsNear(samplePoints[0].lat, samplePoints[0].lon, 2.5)
            : { count: 0, avgCalm: null };
        const loudWarnings = samplePoints.length
            ? getLoudWarningsNear(samplePoints[0].lat, samplePoints[0].lon, { radiusKm: 0.6, withinMinutes: 120 })
            : [];

        const estimatedDb = Math.round(
            0.45 * historicalDb +
            0.35 * realtime.db +
            0.2 * (38 + distanceKm * 0.8 + Math.min(loudWarnings.length, 5) * 3)
        );

        const noiseRisk = normalize(estimatedDb, 35, 80);
        const crowdRisk = normalize(realtime.crowdIndex + loudWarnings.length * 1.2, 0, 16);
        const lightRisk = normalize(realtime.lightIndex, 0, 10);
        const communityRisk = communityStats.count > 0 ? normalize(10 - communityStats.avgCalm, 0, 10) : 0.45;

        const soundWeight = 0.45 + (prefs.soundSensitivity / 100) * 0.35;
        const crowdWeight = 0.25 + ((100 - prefs.crowdTolerance) / 100) * 0.35;
        const lightWeight = 0.15 + (prefs.lightSensitivity / 100) * 0.2;
        const contextWeight = 0.15;
        const totalWeight = soundWeight + crowdWeight + lightWeight + contextWeight;

        const combinedRisk =
            (noiseRisk * soundWeight +
                crowdRisk * crowdWeight +
                lightRisk * lightWeight +
                communityRisk * contextWeight) / totalWeight;

        const timePenalty = normalize(durationMin, 5, 90) * 0.08;
        const sensoryRisk = Number(Math.min(100, Math.max(1, (combinedRisk + timePenalty) * 100)).toFixed(1));
        const calmScore = Number(Math.max(1, Math.min(10, 10 - sensoryRisk / 12)).toFixed(1));

        return {
            routeIndex,
            durationLabel: hours > 0 ? `${hours}h ${mins}m` : `${mins} min`,
            distanceLabel: `${distanceKm.toFixed(1)} km`,
            noiseLabel: noiseToLabel(estimatedDb),
            sensoryRisk,
            calmScore,
            estimatedDb,
            communityCount: communityStats.count
        };
    }

    function pickSamplePoints(points) {
        if (!points.length) return [];
        const idxs = [0, Math.floor(points.length / 2), Math.max(0, points.length - 1)];
        return idxs.map((idx) => ({ lon: points[idx][0], lat: points[idx][1] }));
    }

    async function getRealtimeContext(samples) {
        if (!samples.length) return { db: 50, crowdIndex: 4, lightIndex: 3 };
        const center = samples[Math.floor(samples.length / 2)];

        const query = `
            [out:json][timeout:10];
            (
              way["highway"~"motorway|trunk|primary|secondary"](around:900,${center.lat},${center.lon});
              node["amenity"~"bus_station|marketplace|fuel|parking"](around:900,${center.lat},${center.lon});
              node["shop"](around:900,${center.lat},${center.lon});
            );
            out tags 80;
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
                // next mirror
            }
        }

        let roads = 0;
        let crowdNodes = 0;
        let shops = 0;
        for (const el of elements) {
            const tags = el?.tags || {};
            if (tags.highway) roads += 1;
            if (tags.amenity === 'bus_station' || tags.amenity === 'marketplace' || tags.amenity === 'parking' || tags.amenity === 'fuel') {
                crowdNodes += 1;
            }
            if (tags.shop) shops += 1;
        }

        const db = Math.round(42 + Math.min(roads, 12) * 1.3 + Math.min(crowdNodes, 10) * 1.1 + Math.min(shops, 12) * 0.4);
        const crowdIndex = Math.min(16, crowdNodes + shops * 0.35);
        const lightIndex = Math.min(10, shops * 0.5 + roads * 0.2);

        return { db, crowdIndex, lightIndex };
    }

    function noiseToLabel(db) {
        if (db <= 45) return `Quiet (${db} dB)`;
        if (db <= 58) return `Moderate (${db} dB)`;
        return `Busy (${db} dB)`;
    }

    function normalize(value, min, max) {
        if (max <= min) return 0;
        const n = (value - min) / (max - min);
        return Math.max(0, Math.min(1, n));
    }

    useEffect(() => {
        if (originMode === 'current' && (currentOrigin.lat == null || currentOrigin.lon == null) && !locating) {
            detectCurrentLocation();
        }
    }, [originMode]); // eslint-disable-line react-hooks/exhaustive-deps

    const startForMaps = originMode === 'current' && currentOrigin.lat != null && currentOrigin.lon != null
        ? `${currentOrigin.lat},${currentOrigin.lon}`
        : origin;

    const prefLabel = useMemo(() => {
        return `Prefs: Sound ${preferences.soundSensitivity} / Light ${preferences.lightSensitivity} / Crowd tol ${preferences.crowdTolerance}`;
    }, [preferences]);

    return (
        <div className="routes-grid">
            <motion.div
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
                <h1 className="text-gradient" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
                    Sensory Route Planner
                </h1>
                <div style={{ fontSize: '.85rem', color: 'var(--neutral-text-light)' }}>
                    Uses historical noise + real-time context + community data + your sensory profile.
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--neutral-text-light)' }}>
                    {prefLabel} | Historical noise baseline: {historicalAvgDb} dB
                </div>

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
                            {loading ? 'Computing Sensory Risk...' : 'Find Lowest Sensory-Impact Route'}
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
                        <h3 style={{ marginBottom: '.9rem', color: 'var(--success)' }}>
                            Recommended Route #{route.routeIndex}
                        </h3>
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
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Noise</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{route.noiseLevel}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Calm Score</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{Number(route.calmScore || 0).toFixed(1)}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Sensory Risk</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{route.sensoryRisk}</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--foreground)', fontSize: '.88rem' }}>{route.description}</p>
                    </motion.div>
                )}

                {alternatives.length > 0 && (
                    <div className="glass-panel" style={{ padding: '12px' }}>
                        <h4 style={{ marginBottom: '8px' }}>Other Route Options</h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {alternatives.map((alt) => (
                                <div key={alt.routeIndex} className="card" style={{ padding: '10px' }}>
                                    <div style={{ fontWeight: 700 }}>Route #{alt.routeIndex}</div>
                                    <div style={{ fontSize: '.84rem', color: 'var(--neutral-text-light)' }}>
                                        Risk {alt.sensoryRisk} | Calm {alt.calmScore} | {alt.noiseLabel}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="glass-panel map-panel">
                <div className="map-stage">
                    <div className="tech-grid"></div>
                    {loading ? (
                        <div style={{ textAlign: 'center', zIndex: 10 }}>
                            <div className="spinner"></div>
                            <h3 className="text-gradient">Evaluating Sensory Risk...</h3>
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
                                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this low sensory route from ${startForMaps} to ${destination}: https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startForMaps)}&destination=${encodeURIComponent(destination)}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    Share
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', zIndex: 10, opacity: 0.78 }}>
                            <h3 style={{ color: 'var(--text-muted)' }}>Enter locations to generate sensory-safe routes</h3>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .routes-grid {
                    display: grid;
                    grid-template-columns: minmax(290px, 430px) minmax(0, 1fr);
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
