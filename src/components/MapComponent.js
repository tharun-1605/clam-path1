'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const containerStyle = {
    width: '100%',
    height: '70vh',
    borderRadius: '16px',
};

// Default center
const defaultCenter = {
    lat: 40.785091,
    lng: -73.968285
};

const safeHavens = [
    { id: 1, lat: 40.7829, lng: -73.9654, name: "Quiet Library", type: "library" },
    { id: 2, lat: 40.7812, lng: -73.9665, name: "Serene Park Bench", type: "park" },
];

export default function MapComponent() {
    const [apiKey] = useState(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || "invalid_key", // Prevent hook crash
        libraries: ['visualization', 'places']
    });

    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // In a real app we'd fetch data here
    }, []);

    const onLoad = (map) => {
        setMap(map);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                map.panTo({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, () => { }, { timeout: 5000 });
        }
    };

    const onUnmount = () => {
        setMap(null);
    };

    if (!apiKey) {
        return (
            <div className="glass-panel" style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
                <h2>Map Unavailable</h2>
                <p>Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing Mock Safe Havens List instead:</p>
                <ul>
                    {safeHavens.map(h => <li key={h.id}>{h.name}</li>)}
                </ul>
            </div>
        );
    }

    if (loadError) {
        return <div className="glass-panel" style={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Map cannot load. Check API Key.</div>;
    }

    if (!isLoaded) {
        return <div className="glass-panel" style={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Sensory Map...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                ],
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#38bdf8",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                    }}
                />
            )}
            {safeHavens.map(haven => (
                <Marker
                    key={haven.id}
                    position={{ lat: haven.lat, lng: haven.lng }}
                    title={haven.name}
                />
            ))}
        </GoogleMap>
    );
}
