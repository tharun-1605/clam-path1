'use client';

import { useState, useEffect } from 'react';
import PanicButton from '../../components/PanicButton'; // Keep floating panic button as backup or specifically for map
import VideoUpload from '../../components/VideoUpload';
import MusicPlayer from '../../components/MusicPlayer';
import CalmScoreHeader from '../../components/CalmScoreHeader';
import SafeHavensPreview from '../../components/SafeHavensPreview';
import QuickActionGrid from '../../components/QuickActionGrid';

const DEFAULT_COORDS = { lat: 40.785091, lng: -73.968285 };
const DEFAULT_LOCATION = "Current Area";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [mapCoords, setMapCoords] = useState(DEFAULT_COORDS);
    const [locationLabel, setLocationLabel] = useState("Detecting location...");

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
                const resolvedName = await resolveLocationName(latitude, longitude);
                setLocationLabel(resolvedName);
            },
            () => {
                setLocationLabel(DEFAULT_LOCATION);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    }, []);

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

    if (!mounted) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
                <div className="text-gradient" style={{ fontSize: '1.5rem' }}>Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 1fr) minmax(400px, 2fr) minmax(260px, 1fr)', // Reduced widths for better fit
            gap: '20px',
            height: '100%',
            paddingBottom: '20px'
        }}>

            {/* Left Column: Havens & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
                <SafeHavensPreview />
            </div>

            {/* Center Column: Map & Score */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
                <CalmScoreHeader score={7.2} location={locationLabel} />
                <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
                    <QuickActionGrid />
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Analysis</h3>
                    <VideoUpload />
                </div>

                <div style={{ padding: '0 10px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Sensory Tools
                    </div>
                    <MusicPlayer />
                </div>
            </div>

        </div>
    );
}
