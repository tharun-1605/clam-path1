'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin, Star, Coffee, BookOpen, Trees, Navigation } from 'lucide-react';

export default function SafeHavensPreview() {
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
                    setLoading(false);
                }
            );
        } else {
            setError("Location not supported.");
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
              node["amenity"="library"](around:3000,${lat},${lon});
              node["amenity"="cafe"](around:2000,${lat},${lon});
              way["leisure"="park"](around:3000,${lat},${lon});
            );
            out center 20;
        `;

        let success = false;
        for (const server of OVERPASS_SERVERS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(server, {
                    method: 'POST',
                    body: query,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`Status ${response.status}`);
                const data = await response.json();

                if (data.elements) {
                    const processed = data.elements
                        .filter(e => e.tags && (e.lat || (e.center && e.center.lat)))
                        .map(e => {
                            const eLat = e.lat || e.center.lat;
                            const eLon = e.lon || e.center.lon;
                            const dist = getDistanceFromLatLonInKm(lat, lon, eLat, eLon);
                            const tags = e.tags || {};

                            let type = "Place";
                            let score = 7.5;
                            let features = ["Quiet Area"];

                            if (tags.leisure === 'park') {
                                type = 'Park'; score = 9.2; features = ["Nature", "Benches", "Shade"];
                            } else if (tags.amenity === 'library') {
                                type = 'Library'; score = 8.8; features = ["Quiet Zones", "Study Space", "AC"];
                            } else if (tags.amenity === 'cafe') {
                                type = 'Cafe'; score = 7.9; features = ["Cozy", "Low Music"];
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

                    setHavens(processed.slice(0, 10));
                    success = true;
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn(`Failed to fetch from ${server}:`, err);
            }
        }

        if (!success) {
            setError("Could not fetch places. Network busy.");
        }
        setLoading(false);
    };

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    const handleNavigate = (haven) => {
        let url = `https://www.google.com/maps/dir/?api=1&destination=${haven.lat},${haven.lng}`;
        if (userLoc) {
            url += `&origin=${userLoc.lat},${userLoc.lng}`;
        }
        window.open(url, '_blank');
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Nearby Safe Havens</h3>
                <Link href="/dashboard/safe-havens" style={{ color: 'var(--primary-teal)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                    View All
                </Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    Scanning nearby area...
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--accent-coral)' }}>{error}</div>
            ) : havens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No quiet spots found nearby.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {havens.map(haven => (
                        <div key={haven.id} className="card" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{
                                    background: 'rgba(78, 205, 196, 0.1)',
                                    color: 'var(--primary-teal-dark)',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {haven.type === 'Park' && <Trees size={12} />}
                                    {haven.type === 'Library' && <BookOpen size={12} />}
                                    {haven.type === 'Cafe' && <Coffee size={12} />}
                                    {haven.type}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-teal-dark)' }}>{haven.distance}</span>
                            </div>

                            <h4 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--neutral-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {haven.name}
                            </h4>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ECC94B', fontWeight: 700 }}>
                                    <Star size={14} fill="#ECC94B" /> {haven.rating}
                                </div>
                                <div style={{ color: 'var(--primary-teal-dark)', fontWeight: 600 }}>
                                    {haven.score} Calm Score
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                {haven.features.slice(0, 2).map(f => (
                                    <span key={f} style={{
                                        fontSize: '0.65rem',
                                        background: 'rgba(0,0,0,0.04)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        color: 'var(--neutral-text-light)'
                                    }}>
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '8px', fontSize: '0.85rem', gap: '6px' }}
                                onClick={() => handleNavigate(haven)}
                            >
                                <Navigation size={14} /> Navigate
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
