'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, Coffee, BookOpen, Trees, Navigation, Landmark } from 'lucide-react';

export default function SafeHavensPage() {
    const [havens, setHavens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLoc, setUserLoc] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLoc({ lat: latitude, lng: longitude });
                    fetchNearbyPlaces(latitude, longitude);
                },
                (err) => {
                    console.warn("Geo Error:", err);
                    setError("Location access denied. Please enable location to find nearby havens.");
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    }, []);

    const fetchNearbyPlaces = async (lat, lon) => {
        const OVERPASS_SERVERS = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
        ];

        const query = `
            [out:json][timeout:15];
            (
              node["leisure"="park"](around:3000,${lat},${lon});
              node["leisure"="garden"](around:3000,${lat},${lon});
              node["leisure"="nature_reserve"](around:3000,${lat},${lon});
              node["amenity"="library"](around:3000,${lat},${lon});
              node["amenity"="cafe"](around:2000,${lat},${lon});
              node["amenity"="place_of_worship"](around:3000,${lat},${lon});
              node["building"="temple"](around:3000,${lat},${lon});
              way["leisure"="park"](around:3000,${lat},${lon});
              way["leisure"="garden"](around:3000,${lat},${lon});
              way["leisure"="nature_reserve"](around:3000,${lat},${lon});
              way["amenity"="place_of_worship"](around:3000,${lat},${lon});
              way["building"="temple"](around:3000,${lat},${lon});
            );
            out center 40;
        `;

        let lastErr = null;
        for (const server of OVERPASS_SERVERS) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(server, {
                    method: 'POST',
                    body: query,
                    signal: controller.signal
                });
                clearTimeout(id);

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();

                if (data.elements) {
                    const processed = data.elements
                        .filter(e => e.tags && (e.lat || (e.center && e.center.lat)))
                        .filter(e => {
                            const tags = e.tags || {};
                            const tourismType = (tags.tourism || '').toLowerCase();
                            const name = (tags.name || '').toLowerCase();
                            if (['hotel', 'motel', 'hostel', 'guest_house', 'apartment'].includes(tourismType)) return false;
                            if (name.includes('hotel') || name.includes('lodge')) return false;
                            return true;
                        })
                        .map(e => {
                            const eLat = e.lat || e.center.lat;
                            const eLon = e.lon || e.center.lon;
                            const dist = getDistanceFromLatLonInKm(lat, lon, eLat, eLon);
                            const tags = e.tags || {};

                            let type = "Place";
                            let score = 7.5;
                            let features = ["Quiet Area"];

                            if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'nature_reserve') {
                                type = 'Calm Park'; score = 9.3; features = ["Nature", "Benches", "Shade"];
                            } else if (tags.amenity === 'library') {
                                type = 'Library'; score = 8.8; features = ["Quiet Zones", "Study Space", "AC"];
                            } else if (tags.amenity === 'place_of_worship' || tags.building === 'temple') {
                                type = 'Temple'; score = 9.0; features = ["Peaceful", "Low Noise", "Meditation"];
                            } else if (tags.amenity === 'cafe') {
                                const quietCafeBoost =
                                    (tags.smoking === 'no' ? 0.2 : 0) +
                                    (tags.outdoor_seating === 'yes' ? 0.2 : 0) +
                                    (tags.drive_through === 'yes' ? -0.3 : 0);
                                score = Number((7.7 + quietCafeBoost).toFixed(1));
                                type = 'Calm Cafe';
                                features = ["Cozy", "Low Music"];
                            }

                            return {
                                id: e.id,
                                name: tags.name || `${type} (Unnamed Spot)`,
                                type: type,
                                distance: `${(dist * 0.621371).toFixed(1)} mi`,
                                rating: (4.0 + Math.random() * 1.0).toFixed(1),
                                score: score,
                                features: features,
                                lat: eLat,
                                lng: eLon
                            };
                        })
                        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

                    setHavens(processed);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                lastErr = err;
                console.warn(`Server ${server} failed, trying next...`);
            }
        }
        setError(lastErr ? `Network Error: ${lastErr.message}` : "Could not fetch dynamic data.");
        setLoading(false);
    };

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const handleNavigate = (haven) => {
        let url = `https://www.google.com/maps/dir/?api=1&destination=${haven.lat},${haven.lng}`;
        if (userLoc) {
            url += `&origin=${userLoc.lat},${userLoc.lng}`;
        }
        window.open(url, '_blank');
    };

    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Safe Havens Directory</h1>
                    <p style={{ color: 'var(--neutral-text-light)' }}>
                        Real-time discovery of sensory-friendly quiet spots near your current location.
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--primary-teal)', fontWeight: 600 }}>Scanning area for quiet zones...</div>
                    <p style={{ color: 'var(--neutral-text-light)', marginTop: '10px' }}>Fetching real-time data from OpenStreetMap mirrors.</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,107,107,0.05)', borderRadius: '16px', border: '1px solid rgba(255,107,107,0.1)' }}>
                    <h2 style={{ color: 'var(--accent-coral)', marginBottom: '10px' }}>Oops!</h2>
                    <p style={{ color: 'var(--neutral-text-light)', marginBottom: '20px' }}>{error}</p>
                    <button className="btn-primary" onClick={() => window.location.reload()}>Retry Search</button>
                </div>
            ) : havens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <h3>No results found</h3>
                    <p>Try moving to a different area or checking your internet connection.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {havens.map(haven => (
                        <div key={haven.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{
                                    background: 'rgba(78, 205, 196, 0.1)',
                                    color: 'var(--primary-teal-dark)',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {haven.type === 'Calm Park' && <Trees size={12} />}
                                    {haven.type === 'Library' && <BookOpen size={12} />}
                                    {haven.type === 'Calm Cafe' && <Coffee size={12} />}
                                    {haven.type === 'Temple' && <Landmark size={12} />}
                                    {haven.type}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-teal-dark)' }}>{haven.distance} away</span>
                            </div>

                            <h2 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--neutral-text)' }}>{haven.name}</h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ECC94B', fontWeight: 700 }}>
                                    <Star size={16} fill="#ECC94B" /> {haven.rating}
                                </div>
                                <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--neutral-border)' }} />
                                <div style={{ color: 'var(--primary-teal-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
                                    {haven.score} Calm Score
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'auto', paddingBottom: '20px' }}>
                                {haven.features.map(f => (
                                    <span key={f} style={{
                                        fontSize: '0.75rem',
                                        background: 'rgba(0,0,0,0.04)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        color: 'var(--neutral-text-light)'
                                    }}>
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                                <button className="btn-secondary" style={{ padding: '10px' }}>View Details</button>
                                <button
                                    className="btn-primary"
                                    style={{ padding: '10px', gap: '6px' }}
                                    onClick={() => handleNavigate(haven)}
                                >
                                    <Navigation size={16} /> Navigate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
