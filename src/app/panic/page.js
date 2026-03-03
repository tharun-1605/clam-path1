'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export default function PanicModePage() {
    const [step, setStep] = useState('breathing'); // breathing, locating, found
    const [nearestHaven, setNearestHaven] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial breathing phase
    useEffect(() => {
        const timer = setTimeout(() => {
            setStep('locating');
        }, 4000); // 4 seconds of breathing
        return () => clearTimeout(timer);
    }, []);

    // Locating phase
    useEffect(() => {
        if (step === 'locating') {
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
        }
    }, [step]);

    const findNearestHaven = async (lat, lon) => {
        // Robust fetcher using multiple mirrors
        const OVERPASS_SERVERS = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
        ];

        // Query for nearest quiet place (sorted by distance implies fetch all and sort)
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
                    // Find the absolute closest one
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
                                walkTime: `${Math.ceil(minDist * 15)} min walk`, // rough est
                                lat: place.lat,
                                lon: place.lon
                            };
                        }
                    });

                    setNearestHaven(closest);
                    setStep('found');
                    success = true;
                    break;
                }
            } catch (err) {
                console.warn(`Failed fetch from ${server}`, err);
            }
        }

        if (!success) {
            setError("No quiet places found nearby.");
        }
        setLoading(false);
    };

    // Helper: Haversine
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }
    function deg2rad(deg) { return deg * (Math.PI / 180); }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#E0F2F1', color: '#004D40', padding: '20px', textAlign: 'center' }}>

            {/* Breathing Animation - shown initially */}
            {step === 'breathing' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    style={{ width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(78, 205, 196, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Breathe In...</h2>
                </motion.div>
            )}

            {/* Finding / Result View */}
            {step !== 'breathing' && (
                <div style={{ marginTop: '0px', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#00695C' }}>
                        {loading && !nearestHaven ? "Finding Safe Space..." : "Help is here."}
                    </h2>
                    <p style={{ marginBottom: '30px', fontSize: '1.1rem', color: '#004D40' }}>
                        {loading && !nearestHaven ? "Scanning nearby for a quiet place..." : "Focus on your breathing. You are safe."}
                    </p>

                    <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        {loading ? (
                            <div className="spinner" style={{ margin: '40px auto' }}></div> // Simple loader placeholder
                        ) : error ? (
                            <div style={{ color: 'var(--accent-coral)' }}>{error}</div>
                        ) : nearestHaven ? (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#00796B', marginBottom: '10px' }}>Nearest Safe Haven Found</h3>
                                    <div style={{ background: '#E0F2F1', color: '#00695C', display: 'inline-block', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 600 }}>Recommended</div>
                                </div>

                                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#004D40', marginBottom: '10px' }}>{nearestHaven.name}</h2>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#00796B', fontSize: '1.1rem', marginBottom: '30px' }}>
                                    <MapPin size={20} />
                                    <span>{nearestHaven.distance} away ({nearestHaven.walkTime})</span>
                                </div>

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHaven.lat},${nearestHaven.lon}`}
                                    target="_blank"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <button style={{
                                        width: '100%', padding: '18px', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #4ECDC4 0%, #556270 100%)',
                                        color: 'white', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)'
                                    }}>
                                        Start Guidance Now
                                        <ArrowRight size={20} />
                                    </button>
                                </a>
                            </>
                        ) : null}
                    </div>

                    <Link href="/dashboard">
                        <button style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#00796B', fontSize: '1rem', cursor: 'pointer', textDecoration: 'underline' }}>
                            Return to Dashboard
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
