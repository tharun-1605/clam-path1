'use client';

import { useState, useEffect } from 'react';
import PanicButton from '../../components/PanicButton'; // Keep floating panic button as backup or specifically for map
import VideoUpload from '../../components/VideoUpload';
import MusicPlayer from '../../components/MusicPlayer';
import CalmScoreHeader from '../../components/CalmScoreHeader';
import SafeHavensPreview from '../../components/SafeHavensPreview';
import QuickActionGrid from '../../components/QuickActionGrid';
import { getCommunityCalmStatsNear, getLoudWarningsNear } from '../../lib/communityReports';
import { useAuth } from '../../components/AuthContext';

const DEFAULT_COORDS = { lat: 40.785091, lng: -73.968285 };
const DEFAULT_LOCATION = "Current Area";
const DEFAULT_SCORE = 5.0;
const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [mapCoords, setMapCoords] = useState(DEFAULT_COORDS);
    const [locationLabel, setLocationLabel] = useState("Detecting location...");
    const [calmScore, setCalmScore] = useState(DEFAULT_SCORE);
    const [communityStats, setCommunityStats] = useState({ count: 0, avgCalm: null, recent: [] });
    const [loudWarnings, setLoudWarnings] = useState([]);

    useEffect(() => {
        setMounted(true);

        if (!navigator.geolocation) {
            setLocationLabel(DEFAULT_LOCATION);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setMapCoords({ lat: latitude, lng: longitude });
                const [resolvedName, baseScore] = await Promise.all([
                    resolveLocationName(latitude, longitude),
                    resolveAreaCalmScore(latitude, longitude)
                ]);
                const nearbyCommunity = getCommunityCalmStatsNear(latitude, longitude, 3);
                const nearbyLoud = getLoudWarningsNear(latitude, longitude, {
                    excludeUserId: user?.uid || null,
                    radiusKm: 0.5
                });
                setCommunityStats(nearbyCommunity);
                setLoudWarnings(nearbyLoud);

                const blendedScore = nearbyCommunity.count > 0
                    ? Number(((baseScore * 0.75) + (nearbyCommunity.avgCalm * 0.25)).toFixed(1))
                    : baseScore;
                setLocationLabel(resolvedName);
                setCalmScore(blendedScore);
            },
            () => {
                setLocationLabel(DEFAULT_LOCATION);
                setCalmScore(DEFAULT_SCORE);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    }, [user?.uid]);

    const resolveLocationName = async (lat, lng) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('reverse geocode failed');

            const data = await response.json();
            const address = data?.address || {};
            const label =
                address.suburb ||
                address.neighbourhood ||
                address.city_district ||
                address.city ||
                address.town ||
                address.village ||
                address.county;

            if (label) return label;

            if (data?.display_name) {
                const firstPart = data.display_name.split(',')[0]?.trim();
                if (firstPart) return firstPart;
            }
        } catch {
            // fall through to coordinate fallback
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    };

    const resolveAreaCalmScore = async (lat, lng) => {
        const query = `
            [out:json][timeout:10];
            (
              node["leisure"="park"](around:2000,${lat},${lng});
              node["amenity"="library"](around:2000,${lat},${lng});
              node["amenity"="cafe"](around:1500,${lat},${lng});
            );
            out body 50;
        `;

        for (const server of OVERPASS_SERVERS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(server, {
                    method: 'POST',
                    body: query,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                if (!response.ok) continue;

                const data = await response.json();
                const elements = data?.elements || [];

                let parks = 0;
                let libraries = 0;
                let cafes = 0;

                for (const item of elements) {
                    const tags = item?.tags || {};
                    if (tags.leisure === 'park') parks += 1;
                    if (tags.amenity === 'library') libraries += 1;
                    if (tags.amenity === 'cafe') cafes += 1;
                }

                // Nearby green/quiet places increase score, cafes add smaller lift.
                const raw = 3.5 + (parks * 0.8) + (libraries * 0.7) + (cafes * 0.25);
                const bounded = Math.max(1, Math.min(10, raw));
                return Number(bounded.toFixed(1));
            } catch {
                // try next mirror
            }
        }

        return DEFAULT_SCORE;
    };

    if (!mounted) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
                <div className="text-gradient" style={{ fontSize: '1.5rem' }}>Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="live-grid">

            {/* Left Column: Havens & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                <SafeHavensPreview />
            </div>

            {/* Center Column: Map & Score */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                <CalmScoreHeader score={calmScore} location={locationLabel} />
                <div className="glass-panel map-wrap" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                    {/* Replaced API Map with Web View (Iframe) as requested */}
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=loc:${mapCoords.lat},${mapCoords.lng}&z=14&output=embed`}
                        id="dashboard-map-frame"
                    ></iframe>
                    {/* Floating Panic Button on Map */}
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
                        <PanicButton />
                    </div>
                </div>
            </div>

            {/* Right Column: Actions & Tools */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
                    <QuickActionGrid />
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Analysis</h3>
                    {loudWarnings.length > 0 && (
                        <div style={{
                            marginBottom: '12px',
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid rgba(243,95,95,0.35)',
                            background: 'rgba(243,95,95,0.08)',
                            color: '#b42323',
                            fontSize: '.86rem',
                            fontWeight: 700
                        }}>
                            Warning: {loudWarnings.length} loud audio report(s) near this location.
                        </div>
                    )}
                    <VideoUpload />
                    <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                        <div style={{ fontSize: '.88rem', color: 'var(--neutral-text-light)' }}>
                            Community reports near you: <strong style={{ color: 'var(--neutral-text)' }}>{communityStats.count}</strong>
                            {communityStats.avgCalm != null && (
                                <span> | Avg calm: <strong style={{ color: 'var(--neutral-text)' }}>{communityStats.avgCalm}</strong></span>
                            )}
                        </div>
                        {communityStats.recent.slice(0, 3).map((item) => (
                            <div key={item.id} className="card" style={{ padding: '10px' }}>
                                <div style={{ fontSize: '.86rem', fontWeight: 700 }}>{item.locationLabel}</div>
                                <div style={{ fontSize: '.8rem', color: 'var(--neutral-text-light)' }}>
                                    Calm {Number(item.calmScore || 0).toFixed(1)} / 10
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '0 6px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Sensory Tools
                    </div>
                    <MusicPlayer />
                </div>
            </div>

            <style jsx>{`
                .live-grid {
                    display: grid;
                    grid-template-columns: 1.05fr 1.5fr 1fr;
                    gap: 16px;
                    min-height: 100%;
                    padding-bottom: 8px;
                }

                .map-wrap {
                    min-height: 420px;
                }

                @media (max-width: 1280px) {
                    .live-grid {
                        grid-template-columns: 1fr 1.35fr;
                    }
                }

                @media (max-width: 980px) {
                    .live-grid {
                        grid-template-columns: 1fr;
                    }
                    .map-wrap {
                        min-height: 320px;
                    }
                }
            `}</style>
        </div>
    );
}
