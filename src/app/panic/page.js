'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

export default function PanicModePage() {
    const [step, setStep] = useState('breathing'); // breathing, locating, found
    const [nearestHaven, setNearestHaven] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [smartMode, setSmartMode] = useState(true); // Smart Emergency Mode on by default
    const [alertSent, setAlertSent] = useState(false);
    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const noiseNodeRef = useRef(null);
    const oscRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundType, setSoundType] = useState('ocean');
    const [soundVolume, setSoundVolume] = useState(0.45);

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
                        // speak short reassurance immediately
                        if (smartMode) speakSequence();
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
              node["leisure"="garden"](around:2200,${lat},${lon});
              node["leisure"="nature_reserve"](around:3000,${lat},${lon});
              node["amenity"="library"](around:2000,${lat},${lon});
              node["amenity"="cafe"](around:1000,${lat},${lon});
              node["amenity"="place_of_worship"](around:2500,${lat},${lon});
              node["building"="temple"](around:2500,${lat},${lon});
              way["leisure"="park"](around:2000,${lat},${lon});
              way["leisure"="garden"](around:2200,${lat},${lon});
              way["leisure"="nature_reserve"](around:3000,${lat},${lon});
              way["amenity"="place_of_worship"](around:2500,${lat},${lon});
              way["building"="temple"](around:2500,${lat},${lon});
            );
            out center 60;
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
                        const tags = place?.tags || {};
                        if (!tags) return;

                        const placeLat = place.lat ?? place.center?.lat;
                        const placeLon = place.lon ?? place.center?.lon;
                        if (placeLat == null || placeLon == null) return;

                        // Keep panic suggestions focused on calm locations, avoid hotel/lodge noise.
                        const tourismType = (tags.tourism || '').toLowerCase();
                        const nameLower = (tags.name || '').toLowerCase();
                        if (['hotel', 'motel', 'hostel', 'guest_house', 'apartment'].includes(tourismType)) return;
                        if (nameLower.includes('hotel') || nameLower.includes('lodge')) return;

                        const d = getDistanceFromLatLonInKm(lat, lon, placeLat, placeLon);
                        if (d < minDist) {
                            minDist = d;
                            let placeType = 'Calm Spot';
                            if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'nature_reserve') placeType = 'Calm Park';
                            else if (tags.amenity === 'library') placeType = 'Library';
                            else if (tags.amenity === 'cafe') placeType = 'Calm Cafe';
                            else if (tags.amenity === 'place_of_worship' || tags.building === 'temple') placeType = 'Temple';

                            closest = {
                                name: tags.name || "Quiet Spot",
                                type: placeType,
                                distance: `${(minDist * 0.621371).toFixed(1)} mi`,
                                walkTime: `${Math.ceil(minDist * 15)} min walk`, // rough est
                                lat: placeLat,
                                lon: placeLon
                            };
                        }
                    });

                    if (closest) {
                        setNearestHaven(closest);
                        setStep('found');
                        success = true;
                        break;
                    }
                }
            } catch (err) {
                console.warn(`Failed fetch from ${server}`, err);
            }
        }

        if (!success) {
            // Emergency fallback so user always gets a direction target.
            setNearestHaven({
                name: 'Nearby Quiet Place Search',
                type: 'Fallback',
                distance: 'Near you',
                walkTime: 'Open map',
                lat: lat,
                lon: lon
            });
            setStep('found');
        }
        setLoading(false);
        // After we have a nearest haven, auto-send alert and open guidance if smart mode
        if (smartMode) {
            // determine the coordinates to use (closest found or fallback)
            const targetLat = (nearestHaven && nearestHaven.lat) ? nearestHaven.lat : lat;
            const targetLon = (nearestHaven && nearestHaven.lon) ? nearestHaven.lon : lon;

            // small timeout to let UI settle
            setTimeout(() => {
                if (!alertSent) sendAlert(lat, lon);
                // open maps directions automatically after a short pause to avoid jarring navigation
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLon}`,'_blank');
            }, 1200);
        }
    };

    // Send alert message to caregivers via optional backend and device share fallback
    async function sendAlert(lat, lon) {
        try {
            const message = `Emergency: I need help. My live location: https://maps.google.com/?q=${lat},${lon}`;

            // Try server-side endpoint first (non-blocking)
            try {
                // include an id to help clients deduplicate
                const id = `panic_${Date.now()}_${Math.floor(Math.random()*10000)}`;
                await fetch('/api/alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, message, lat, lon, timestamp: Date.now() }) });
            } catch (e) {
                // ignore server errors
            }

            // Try Web Share API (mobile) for quick sending
            if (navigator.share) {
                try {
                    await navigator.share({ title: 'NEURO-NAV Emergency', text: message, url: `https://maps.google.com/?q=${lat},${lon}` });
                    setAlertSent(true);
                    return;
                } catch (err) {
                    // user cancelled or share failed
                }
            }

            // Fallback: open WhatsApp Web with prefilled message (user can choose recipient)
            const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(wa, '_blank');
            setAlertSent(true);
        } catch (err) {
            console.error('Alert send failed', err);
        }
    }

    // Voice-guided calming instructions using Web Speech API
    function speakSequence() {
        if (!('speechSynthesis' in window)) return;
        const s = window.speechSynthesis;
        s.cancel();

        const phrases = [
            'You are safe. Focus on slow, deep breaths.',
            'Breathe in for four seconds. Hold for two. Breathe out for six.',
            'Repeat this breathing pattern. Notice your feet on the ground. You are okay.'
        ];

        phrases.forEach((text, i) => {
            const ut = new SpeechSynthesisUtterance(text);
            ut.lang = 'en-US';
            ut.rate = 0.95;
            ut.pitch = 0.9;
            ut.volume = 1.0;
            ut.onend = () => {
                // last line no-op
            };
            // stagger utterances
            setTimeout(() => {
                try { s.speak(ut); } catch (e) { /* ignore */ }
            }, i * 4200);
        });
    }

    // Soothing sounds via Web Audio (simple generators, no external files)
    function ensureAudioCtx() {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtxRef.current;
    }

    function startSound(type) {
        try {
            const ctx = ensureAudioCtx();
            stopSound();
            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.gain.value = soundVolume;
            gainNodeRef.current.connect(ctx.destination);

            if (type === 'tone') {
                oscRef.current = ctx.createOscillator();
                oscRef.current.type = 'sine';
                oscRef.current.frequency.value = 220; // A3 - gentle
                const oscGain = ctx.createGain();
                oscGain.gain.value = 0.25;
                oscRef.current.connect(oscGain);
                oscGain.connect(gainNodeRef.current);
                oscRef.current.start();
            } else {
                // white noise buffer
                const bufferSize = 2 * ctx.sampleRate;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = type === 'ocean' ? 900 : 5000; // ocean = darker, rain = brighter
                noise.connect(filter);
                filter.connect(gainNodeRef.current);
                noise.start();
                noiseNodeRef.current = noise;
            }

            setIsPlaying(true);
            setSoundType(type);
        } catch (e) {
            console.warn('Audio start failed', e);
        }
    }

    function stopSound() {
        try {
            if (oscRef.current) {
                try { oscRef.current.stop(); } catch {}
                oscRef.current.disconnect();
                oscRef.current = null;
            }
            if (noiseNodeRef.current) {
                try { noiseNodeRef.current.stop(); } catch {}
                noiseNodeRef.current.disconnect();
                noiseNodeRef.current = null;
            }
            if (gainNodeRef.current) {
                try { gainNodeRef.current.disconnect(); } catch {}
                gainNodeRef.current = null;
            }
        } catch (e) {
            // ignore
        }
        setIsPlaying(false);
    }

    // adjust volume live
    function updateVolume(v) {
        setSoundVolume(v);
        try {
            if (gainNodeRef.current) gainNodeRef.current.gain.value = v;
        } catch {}
    }

    // cleanup on unmount
    useEffect(() => {
        return () => {
            stopSound();
            try { if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; } } catch {}
        };
    }, []);

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
                <div style={{ marginTop: '0px', width: '100%', maxWidth: '420px' }}>
                    {/* Ultra-minimal emergency UI when smartMode is active */}
                    {smartMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#004D40' }}>{loading && !nearestHaven ? 'Finding Safe Space...' : 'Emergency Mode Active'}</div>
                            <div style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'none' }}>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '24px' }} className="spinner"></div>
                                ) : error ? (
                                    <div style={{ color: 'var(--accent-coral)' }}>{error}</div>
                                ) : nearestHaven ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#00251A' }}>{nearestHaven.name}</h1>
                                        <div style={{ color: '#004D40', fontSize: '1rem' }}>{nearestHaven.distance} • {nearestHaven.walkTime}</div>
                                        <div style={{ height: '12px' }} />
                                        <button
                                            onClick={() => {
                                                // immediate navigation & ensure voice guidance
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${nearestHaven.lat},${nearestHaven.lon}`,'_blank');
                                                speakSequence();
                                            }}
                                            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#00796B', color: 'white', fontWeight: 700 }}
                                        >
                                            Go (Maps)
                                        </button>

                                        {/* Soothing sounds controls below maps button */}
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong>Soothing Sounds</strong>
                                                <div style={{ fontSize: '0.85rem', color: '#004D40' }}>{isPlaying ? 'Playing' : 'Stopped'}</div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => { if (isPlaying && soundType === 'ocean') stopSound(); else startSound('ocean'); }} style={{ flex: 1, padding: '8px', borderRadius: '8px' }}>{isPlaying && soundType === 'ocean' ? 'Stop Ocean' : 'Play Ocean'}</button>
                                                <button onClick={() => { if (isPlaying && soundType === 'rain') stopSound(); else startSound('rain'); }} style={{ flex: 1, padding: '8px', borderRadius: '8px' }}>{isPlaying && soundType === 'rain' ? 'Stop Rain' : 'Play Rain'}</button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => { if (isPlaying && soundType === 'tone') stopSound(); else startSound('tone'); }} style={{ flex: 1, padding: '8px', borderRadius: '8px' }}>{isPlaying && soundType === 'tone' ? 'Stop Tone' : 'Play Tone'}</button>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                    <input type="range" min="0" max="1" step="0.01" value={soundVolume} onChange={(e) => updateVolume(Number(e.target.value))} style={{ flex: 1 }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                <button
                                    onClick={() => {
                                        // stop emergency: cancel voice, disable smart, go back
                                        try { window.speechSynthesis.cancel(); } catch (e) {}
                                        setSmartMode(false);
                                        setStep('breathing');
                                    }}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#E57373', color: 'white', fontWeight: 700 }}
                                >
                                    Stop Emergency
                                </button>

                                <button
                                    onClick={() => {
                                        // quick manual alert resend
                                        if (nearestHaven) sendAlert(nearestHaven.lat, nearestHaven.lon);
                                    }}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#556270', color: 'white', fontWeight: 700 }}
                                >
                                    Resend Alert
                                </button>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#004D40' }}>{alertSent ? 'Alert sent' : 'Alert not sent'}</div>
                        </div>
                    ) : (
                        // non-smart minimal view
                        <div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{loading ? 'Finding Safe Space...' : 'Help is here.'}</h2>
                            <p style={{ marginBottom: '16px' }}>{loading ? 'Scanning nearby for quiet place...' : 'Focus on breathing.'}</p>
                            <div className="card" style={{ padding: '20px' }}>
                                {loading ? <div className="spinner" /> : error ? <div style={{ color: 'var(--accent-coral)' }}>{error}</div> : nearestHaven && (
                                    <>
                                        <h3 style={{ marginTop: 0 }}>{nearestHaven.name}</h3>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHaven.lat},${nearestHaven.lon}`} target="_blank">Open Maps</a>
                                    </>
                                )}
                            </div>
                            <Link href="/dashboard"><button style={{ marginTop: '12px' }}>Return</button></Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
