'use client';

import { useEffect, useState } from 'react';
import CalmChatbot from '../../../components/CalmChatbot';

const DEFAULT_SCORE = 5.0;

export default function CalmChatPage() {
    const [locationLabel, setLocationLabel] = useState('Detecting location...');
    const [calmScore, setCalmScore] = useState(DEFAULT_SCORE);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationLabel('Current Area');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const label = await reverseGeocode(latitude, longitude);
                setLocationLabel(label);
                setCalmScore(DEFAULT_SCORE);
            },
            () => {
                setLocationLabel('Current Area');
                setCalmScore(DEFAULT_SCORE);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    }, []);

    return (
        <div className="container-max" style={{ padding: '24px 8px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Calm Support Chat</h1>
            <p style={{ color: 'var(--neutral-text-light)', marginBottom: '14px' }}>
                Ask for calming audio, breathing exercises, and mental wellness support.
            </p>
            <CalmChatbot location={locationLabel} calmScore={calmScore} />
        </div>
    );
}

async function reverseGeocode(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('reverse geocode failed');
        const data = await response.json();
        const address = data?.address || {};
        return (
            address.suburb ||
            address.neighbourhood ||
            address.city_district ||
            address.city ||
            address.town ||
            address.village ||
            data?.display_name?.split(',')?.[0]?.trim() ||
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
    } catch {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}
