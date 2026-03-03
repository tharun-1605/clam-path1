'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export default function PanicModePage() {
    const [nearestHaven, setNearestHaven] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Start locating immediately
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
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
            [out:json][timeout:10];
            (
              node["leisure"="park"](around:2000,${lat},${lon});
              node["amenity"="library"](around:2000,${lat},${lon});
              node["amenity"="cafe"](around:1000,${lat},${lon});
            );
            out body;
        `;

        let success = false;
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

                if (!response.ok) throw new Error(`Status ${response.status}`);
                const data = await response.json();

                if (data.elements && data.elements.length > 0) {
                    let minDist = Infinity;
                    let closest = null;

                    data.elements.forEach(place => {
                        if (!place || place.lat == null || place.lon == null || !place.tags) return;
                        const d = getDistanceFromLatLonInKm(lat, lon, place.lat, place.lon);
                        if (d < minDist) {
                            minDist = d;
                            const tags = place.tags || {};
                            closest = {
                                name: tags.name || "Quiet Spot",
                                type: tags.leisure === 'park' ? 'Park' : (tags.amenity === 'library' ? 'Library' : 'Cafe'),
                                distance: `${(minDist * 0.621371).toFixed(1)} mi`,
                                walkTime: `${Math.ceil(minDist * 15)} min walk`,
                                lat: place.lat,
                                lon: place.lon
                            };
                        }
                    });

                    setNearestHaven(closest);
                    success = true;
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn(`Failed fetch from ${server}`, err);
            }
        }

        if (!success && !error) {
            setError("No quiet places found nearby.");
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

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            background: '#E0F2F1',
            color: '#004D40',
            overflow: 'hidden'
        }}>
            {/* Left Section: Breathing Exercise */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                borderRight: '2px solid rgba(0, 77, 64, 0.05)'
            }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    style={{
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(78, 205, 196, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 50px rgba(78, 205, 196, 0.2)'
                    }}
                >
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 600, color: '#004D40' }}>Breathe In...</h2>
                </motion.div>
                <p style={{ marginTop: '30px', fontSize: '1.2rem', opacity: 0.8 }}>Follow the rhythm to calm your mind.</p>
            </div>

            {/* Right Section: Help & Guidance */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#00695C' }}>
                        {loading ? "Finding Safe Space..." : "Help is here."}
                    </h2>
                    <p style={{ marginBottom: '30px', fontSize: '1.1rem', color: '#004D40', opacity: 0.9 }}>
                        {loading ? "Scanning nearby for a quiet place..." : "Focus on your breathing. You are safe."}
                    </p>

                    <div className="card" style={{
                        padding: '30px',
                        background: 'white',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                        minHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        {loading ? (
                            <div style={{ textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                                <p>Locating your position...</p>
                            </div>
                        ) : error ? (
                            <div style={{ color: 'var(--accent-coral)', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{error}</p>
                                <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: '20px' }}>Retry</button>
                            </div>
                        ) : nearestHaven ? (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#00796B', marginBottom: '10px' }}>Nearest Safe Haven</h3>
                                    <div style={{ background: '#E0F2F1', color: '#00695C', display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>Recommended Quiet Spot</div>
                                </div>

                                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#004D40', marginBottom: '12px' }}>{nearestHaven.name}</h2>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00796B', fontSize: '1.1rem', marginBottom: '30px' }}>
                                    <MapPin size={22} />
                                    <span>{nearestHaven.distance} away • {nearestHaven.walkTime}</span>
                                </div>

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHaven.lat},${nearestHaven.lon}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <button style={{
                                        width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                                        background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)',
                                        color: 'white', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        boxShadow: '0 10px 20px rgba(78, 205, 196, 0.3)',
                                        transition: 'transform 0.2s'
                                    }}>
                                        Start Guidance Now
                                        <ArrowRight size={22} />
                                    </button>
                                </a>
                            </>
                        ) : null}
                    </div>

                    <Link href="/dashboard" style={{ display: 'block', marginTop: '30px', textAlign: 'center', color: '#00796B', textDecoration: 'none', fontWeight: 600 }}>
                        <span style={{ textDecoration: 'underline' }}>Return to Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

