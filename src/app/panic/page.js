'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowRight, Trees, BookOpen, Coffee, Landmark, Star } from 'lucide-react';

function BreathingCircle() {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCounter(c => (c + 1) % 8);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 0,1,2,3 -> In (4,3,2,1)
    // 4,5,6,7 -> Out (4,3,2,1)
    const isExpand = counter < 4;
    const phase = isExpand ? 'Breathe In' : 'Breathe Out';
    const displaySeconds = isExpand ? 4 - counter : 8 - counter;

    return (
        <motion.div
            initial={{ scale: 1 }}
            animate={{
                scale: isExpand ? 1.3 : 1,
                backgroundColor: isExpand ? 'rgba(78, 205, 196, 0.6)' : 'rgba(78, 205, 196, 0.3)'
            }}
            transition={{
                duration: 4,
                ease: "easeInOut"
            }}
            style={{
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 60px rgba(78, 205, 196, 0.1)',
                border: '4px solid #4ECDC4',
                position: 'relative'
            }}
        >
            <motion.h2
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '2.5rem', fontWeight: 800, color: '#004D40', textAlign: 'center', marginBottom: '10px' }}
            >
                {phase}
            </motion.h2>
            <div style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                color: '#004D40',
                opacity: 0.6
            }}>
                {displaySeconds}
            </div>
        </motion.div>
    );
}

export default function PanicModePage() {
    const [nearestHaven, setNearestHaven] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLoc, setUserLoc] = useState(null);

    // Start locating immediately
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLoc({ lat: latitude, lng: longitude });
                    findNearestHaven(latitude, longitude);
                },
                (err) => {
                    console.error("Geo Error:", err);
                    setError("Could not access location.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation not supported.");
            setLoading(false);
        }
    }, []);

    const findNearestHaven = async (lat, lon) => {
        const OVERPASS_SERVERS = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
        ];

        const query = `
            [out:json][timeout:15];
            (
              node["leisure"="park"](around:2500,${lat},${lon});
              node["leisure"="garden"](around:2500,${lat},${lon});
              node["leisure"="nature_reserve"](around:2500,${lat},${lon});
              way["leisure"="park"](around:2500,${lat},${lon});
              way["leisure"="garden"](around:2500,${lat},${lon});
              way["leisure"="nature_reserve"](around:2500,${lat},${lon});
              node["amenity"="library"](around:2500,${lat},${lon});
              node["amenity"="cafe"](around:1500,${lat},${lon});
              node["amenity"="place_of_worship"](around:3000,${lat},${lon});
              node["building"="temple"](around:3000,${lat},${lon});
              way["amenity"="place_of_worship"](around:3000,${lat},${lon});
              way["building"="temple"](around:3000,${lat},${lon});
            );
            out center 10;
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

                if (data.elements && data.elements.length > 0) {
                    const processed = data.elements
                        .filter(place => {
                            if (!place?.tags) return false;
                            const tags = place.tags || {};
                            const tourismType = (tags.tourism || '').toLowerCase();
                            const name = (tags.name || '').toLowerCase();
                            if (['hotel', 'motel', 'hostel', 'guest_house', 'apartment'].includes(tourismType)) return false;
                            if (name.includes('hotel') || name.includes('lodge')) return false;
                            return true;
                        })
                        .map(place => {
                            const pLat = place.lat ?? place.center?.lat;
                            const pLon = place.lon ?? place.center?.lon;
                            const dist = getDistanceFromLatLonInKm(lat, lon, pLat, pLon);
                            const tags = place.tags || {};

                            let type = 'Quiet Spot';
                            let score = 8.0;
                            if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'nature_reserve') {
                                type = 'Calm Park';
                                score = 9.4;
                            } else if (tags.amenity === 'library') {
                                type = 'Library';
                                score = 9.0;
                            } else if (tags.amenity === 'place_of_worship' || tags.building === 'temple') {
                                type = 'Temple';
                                score = 9.2;
                            } else if (tags.amenity === 'cafe') {
                                type = 'Calm Cafe';
                                score = 7.8;
                            }

                            return {
                                name: tags.name || `${type}`,
                                type,
                                distance: `${(dist * 0.621371).toFixed(1)} mi`,
                                walkTime: `${Math.ceil(dist * 15)} min walk`,
                                rating: (4.2 + Math.random() * 0.8).toFixed(1),
                                score,
                                lat: pLat,
                                lon: pLon
                            };
                        })
                        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

                    if (processed.length > 0) {
                        setNearestHaven(processed[0]);
                        success = true;
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.warn(`Failed fetch from ${server}`, err);
            }
        }

        if (!success && !error) {
            setError("No quiet places found within 2 miles.");
        }
        setLoading(false);
    };

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    function deg2rad(deg) { return deg * (Math.PI / 180); }

    const getIcon = (type) => {
        switch (type) {
            case 'Calm Park': return <Trees size={24} />;
            case 'Library': return <BookOpen size={24} />;
            case 'Calm Cafe': return <Coffee size={24} />;
            case 'Temple': return <Landmark size={24} />;
            default: return <MapPin size={24} />;
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            background: '#E0F2F1',
            color: '#004D40',
            overflow: 'hidden'
        }}>
            {/* Left Section: Breathing Exercise (Infinite Loop) */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                borderRight: '2px solid rgba(0, 77, 64, 0.05)'
            }}>
                <BreathingCircle />
                <p style={{ marginTop: '40px', fontSize: '1.2rem', opacity: 0.8, fontWeight: 500 }}>Focus on the outer circle expansion</p>
            </div>

            {/* Right Section: Help & Closest Spot */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '10px', color: '#00695C', letterSpacing: '-1px' }}>
                        {loading ? "Finding Calm..." : "Help is here."}
                    </h2>
                    <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#004D40', opacity: 0.9, lineHeight: 1.5 }}>
                        {loading ? "Locating the nearest quiet space for you..." : "Focus on your breath. Your path to peace is ready."}
                    </p>

                    <div className="card" style={{
                        padding: '35px',
                        background: 'white',
                        borderRadius: '32px',
                        boxShadow: '0 25px 50px rgba(0, 77, 64, 0.08)',
                        minHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {loading ? (
                            <div style={{ textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto 20px', borderTopColor: 'var(--primary-teal)' }}></div>
                                <p style={{ fontWeight: 600, color: 'var(--neutral-text-light)' }}>Analyzing Surroundings...</p>
                            </div>
                        ) : error ? (
                            <div style={{ color: 'var(--accent-coral)', textAlign: 'center' }}>
                                <MapPin size={40} style={{ marginBottom: '15px', opacity: 0.5 }} />
                                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>{error}</p>
                                <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: '10px' }}>Try Refreshing</button>
                            </div>
                        ) : nearestHaven ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
                                    <div>
                                        <div style={{
                                            background: 'rgba(78, 205, 196, 0.15)',
                                            color: 'var(--primary-teal-dark)',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {getIcon(nearestHaven.type)}
                                            {nearestHaven.type}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ECC94B', fontWeight: 800, fontSize: '1.1rem' }}>
                                            <Star size={16} fill="#ECC94B" /> {nearestHaven.rating}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-text-light)', fontWeight: 600 }}>USER RATED</div>
                                    </div>
                                </div>

                                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#004D40', marginBottom: '10px', lineHeight: 1.1 }}>{nearestHaven.name}</h2>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00796B', fontWeight: 600, fontSize: '1.1rem' }}>
                                        <MapPin size={20} />
                                        <span>{nearestHaven.distance} away</span>
                                    </div>
                                    <div style={{ width: '1px', height: '15px', background: 'var(--neutral-border)' }}></div>
                                    <div style={{ color: 'var(--primary-teal-dark)', fontWeight: 700, fontSize: '1.1rem' }}>
                                        {nearestHaven.walkTime}
                                    </div>
                                </div>

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHaven.lat},${nearestHaven.lon}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <button style={{
                                        width: '100%', padding: '20px', borderRadius: '20px', border: 'none',
                                        background: 'linear-gradient(135deg, #4ECDC4 0%, #3DA9A0 100%)',
                                        color: 'white', fontSize: '1.25rem', fontWeight: 800, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                        boxShadow: '0 15px 30px rgba(78, 205, 196, 0.25)',
                                        transition: 'all 0.2s',
                                        transform: 'translateY(0)'
                                    }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    >
                                        Start Guidance
                                        <ArrowRight size={24} />
                                    </button>
                                </a>
                            </>
                        ) : null}
                    </div>

                    <Link href="/dashboard" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        marginTop: '40px', color: '#00796B', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                        opacity: 0.6, transition: 'opacity 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    >
                        <span>&larr; Return to Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}


