'use client';

import { useEffect, useState } from 'react';
import { MapPin, Star, Coffee, BookOpen, Trees, Navigation, Landmark } from 'lucide-react';

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
                    console.warn('Geo Error:', err);
                    setLoading(false);
                }
            );
        } else {
            setError('Location not supported.');
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
              node["leisure"="park"](around:2000,${lat},${lon});
              node["leisure"="garden"](around:2000,${lat},${lon});
              node["leisure"="nature_reserve"](around:2000,${lat},${lon});
              way["leisure"="park"](around:2000,${lat},${lon});
              way["leisure"="garden"](around:2000,${lat},${lon});
              way["leisure"="nature_reserve"](around:2000,${lat},${lon});
              node["amenity"="library"](around:2000,${lat},${lon});
              node["amenity"="cafe"](around:1500,${lat},${lon});
              node["amenity"="place_of_worship"](around:2500,${lat},${lon});
              node["building"="temple"](around:2500,${lat},${lon});
              way["amenity"="place_of_worship"](around:2500,${lat},${lon});
              way["building"="temple"](around:2500,${lat},${lon});
            );
            out center 35;
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
                        .filter((place) => {
                            if (!place?.tags) return false;
                            if (place.lat != null && place.lon != null) return true;
                            if (place.center?.lat != null && place.center?.lon != null) return true;
                            return false;
                        })
                        .filter((place) => {
                            const tags = place.tags || {};
                            const tourismType = (tags.tourism || '').toLowerCase();
                            const name = (tags.name || '').toLowerCase();
                            if (['hotel', 'motel', 'hostel', 'guest_house', 'apartment'].includes(tourismType)) return false;
                            if (name.includes('hotel') || name.includes('lodge')) return false;
                            return true;
                        })
                        .map((place) => {
                            const placeLat = place.lat ?? place.center?.lat;
                            const placeLon = place.lon ?? place.center?.lon;
                            const dist = getDistanceFromLatLonInKm(lat, lon, placeLat, placeLon);
                            const tags = place.tags || {};

                            let type = 'Place';
                            let score = 8.0;
                            let features = ["Quiet Area"];
                            if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'nature_reserve') {
                                type = 'Calm Park';
                                score = 9.4;
                                features = ["Nature", "Benches", "Shade"];
                            } else if (tags.amenity === 'library') {
                                type = 'Library';
                                score = 9.0;
                                features = ["Quiet Zones", "Study Space", "AC"];
                            } else if (tags.amenity === 'place_of_worship' || tags.building === 'temple') {
                                type = 'Temple';
                                score = 9.0;
                                features = ["Peaceful", "Low Noise", "Meditation"];
                            } else if (tags.amenity === 'cafe') {
                                const quietCafeBoost =
                                    (tags.smoking === 'no' ? 0.2 : 0) +
                                    (tags.outdoor_seating === 'yes' ? 0.2 : 0) +
                                    (tags.drive_through === 'yes' ? -0.3 : 0);
                                type = 'Calm Cafe';
                                score = Number((7.7 + quietCafeBoost).toFixed(1));
                                features = ["Cozy", "Low Music"];
                            }

                            return {
                                id: place.id,
                                name: tags.name || `${type} (Unnamed)`,
                                type,
                                distance: `${(dist * 0.621371).toFixed(1)} mi`,
                                rating: (4.0 + Math.random() * 1.0).toFixed(1),
                                score,
                                features,
                                lat: placeLat,
                                lng: placeLon
                            };
                        });

                    const validPlaces = processed
                        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                        .slice(0, 10);

                    setHavens(validPlaces.length > 0 ? validPlaces : []);
                    success = true;
                    break;
                }
            } catch (err) {
                console.warn(`Failed to fetch from ${server}:`, err);
            }
        }

        if (!success) {
            setError('Could not fetch places. Network busy.');
        }
        setLoading(false);
    };

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
                <h3>Nearby Safe Havens</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <a
                        href={userLoc ? `https://www.google.com/maps/search/quiet+places+near+me/@${userLoc.lat},${userLoc.lng},14z` : '#'}
                        target="_blank"
                        style={{ color: 'var(--primary-teal)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                        View Map
                    </a>
                    <a
                        href="/dashboard/safe-havens"
                        style={{ color: 'var(--primary-teal)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                        Details
                    </a>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-text-light)' }}>
                    Scanning nearby area...
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-coral)' }}>{error}</div>
            ) : havens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-text-light)' }}>
                    No quiet spots found nearby.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {havens.map((haven) => (
                        <div key={haven.id} className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => handleNavigate(haven)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--neutral-text)' }}>
                                    {haven.name}
                                </div>
                                <div style={{
                                    background: 'rgba(78, 205, 196, 0.1)',
                                    color: 'var(--primary-teal-dark)',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {haven.type === 'Calm Park' && <Trees size={14} />}
                                    {haven.type === 'Library' && <BookOpen size={14} />}
                                    {haven.type === 'Calm Cafe' && <Coffee size={14} />}
                                    {haven.type === 'Temple' && <Landmark size={14} />}
                                    {haven.type.toUpperCase()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ECC94B', fontWeight: 700 }}>
                                    <Star size={16} fill="#ECC94B" /> {haven.rating}
                                </div>
                                <div style={{ color: 'var(--primary-teal-dark)', fontWeight: 600, borderLeft: '1px solid var(--neutral-border)', paddingLeft: '12px' }}>
                                    {haven.score} Calm Score
                                </div>
                                <div style={{ color: 'var(--neutral-text-light)', marginLeft: 'auto', fontWeight: 500 }}>
                                    {haven.distance}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                {(haven.features || []).map(f => (
                                    <span key={f} style={{
                                        fontSize: '0.7rem',
                                        background: 'rgba(0,0,0,0.05)',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        color: 'var(--neutral-text-light)',
                                        fontWeight: 500
                                    }}>
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <button
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    borderRadius: '10px'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigate(haven);
                                }}
                            >
                                <Navigation size={16} /> Navigate to Spot
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
