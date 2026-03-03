'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin, Star, Coffee, BookOpen, Trees } from 'lucide-react';

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

                    // Update Dashboard Map Iframe if it exists
                    const mapFrame = document.getElementById('dashboard-map-frame');
                    if (mapFrame) {
                        mapFrame.src = `https://maps.google.com/maps?q=loc:${latitude},${longitude}&z=14&output=embed`;
                    }

                    fetchNearbyPlaces(latitude, longitude);
                },
                (err) => {
                    // geolocation failures are expected when user denies permission
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
        // Robust fetcher using multiple mirrors to handle rate limiting/downtime
        const OVERPASS_SERVERS = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
        ];

        const query = `
            [out:json][timeout:10];
            (
              node["leisure"="park"](around:2000,${lat},${lon});
              node["amenity"="library"](around:2000,${lat},${lon});
              node["amenity"="cafe"](around:1500,${lat},${lon});
            );
            out body 10;
        `;

        let success = false;

        for (const server of OVERPASS_SERVERS) {
            try {
                console.log(`Trying Overpass server: ${server}`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per server

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
                        .filter(place => place && place.lat != null && place.lon != null && place.tags)
                        .map(place => {
                            // Calculate simplified distance
                            const dist = getDistanceFromLatLonInKm(lat, lon, place.lat, place.lon);

                            // Determine type and score with safe tag access
                            const tags = place.tags || {};
                            let type = "Place";
                            let score = 8.0;
                            if (tags.leisure === 'park') { type = 'Park'; score = 9.5; }
                            else if (tags.amenity === 'library') { type = 'Library'; score = 9.0; }
                            else if (tags.amenity === 'cafe') { type = 'Cafe'; score = 7.5; }

                            return {
                                id: place.id,
                                name: tags.name || `${type} (Unnamed)`,
                                type: type,
                                distance: `${(dist * 0.621371).toFixed(1)} mi`, // convert km to miles
                                rating: 4.5, // Mock rating as OSM doesn't have ratings
                                score: score
                            };
                        });
                    // Filter duplicates or bad names if needed
                    const validPlaces = processed.slice(0, 10); // Take top 10
                    setHavens(validPlaces.length > 0 ? validPlaces : []);
                    success = true;
                    break; // Stop if successful
                }
            } catch (err) {
                console.warn(`Failed to fetch from ${server}:`, err);
                // Continue to next server
            }
        }

        if (!success) {
            setError("Could not fetch places. Network busy.");
        }
        setLoading(false);
    };

    // Helper: Haversine Formula for distance
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    return (
        <div className="glass-panel" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Nearby Safe Havens</h3>
                {/* External Link to Google Maps Search as "Filter" option */}
                <a
                    href={userLoc ? `https://www.google.com/maps/search/quiet+places+near+me/@${userLoc.lat},${userLoc.lng},14z` : '#'}
                    target="_blank"
                    style={{ color: 'var(--primary-teal)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                >
                    View Map
                </a>
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
                        <div key={haven.id} className="card" style={{ padding: '15px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                    {haven.name}
                                </div>
                                <div style={{
                                    background: 'rgba(78, 205, 196, 0.1)', color: 'var(--primary-teal-dark)',
                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700
                                }}>
                                    {haven.score}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {haven.type === 'Park' && <Trees size={14} />}
                                {haven.type === 'Library' && <BookOpen size={14} />}
                                {haven.type === 'Cafe' && <Coffee size={14} />}
                                {haven.type} • {haven.distance}
                            </div>
                            <div style={{ color: '#F6E05E', fontSize: '0.9rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={12} fill="#F6E05E" />
                                {haven.rating} <span style={{ color: 'var(--neutral-text-light)' }}>({haven.score} Calm Score)</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
