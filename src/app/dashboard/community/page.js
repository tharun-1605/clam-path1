'use client';

import { useEffect, useRef, useState } from 'react';
import VideoUpload from '../../../components/VideoUpload';
import { useAuth } from '../../../components/AuthContext';
import { getLoudWarningsNear, loadCommunityReports, saveCommunityReport } from '../../../lib/communityReports';

const TRIGGER_OPTIONS = ['Loud Noises', 'Bright Lights', 'Crowds', 'Construction'];
const AUDIO_BINARY_THRESHOLD_DB = 65;

export default function CommunityPage() {
    const { user } = useAuth();
    const [calmScore, setCalmScore] = useState(5);
    const [notes, setNotes] = useState('');
    const [triggers, setTriggers] = useState([]);
    const [locationText, setLocationText] = useState('Detecting current location...');
    const [coords, setCoords] = useState({ lat: null, lon: null });
    const [statusMsg, setStatusMsg] = useState('');
    const [recentReports, setRecentReports] = useState([]);
    const [nearbyWarnings, setNearbyWarnings] = useState([]);
    const [micActive, setMicActive] = useState(false);
    const [audioDb, setAudioDb] = useState(0);
    const [audioBinary, setAudioBinary] = useState(0);
    const [micError, setMicError] = useState('');
    const [voiceRecording, setVoiceRecording] = useState(false);
    const [voiceClipUrl, setVoiceClipUrl] = useState('');
    const [voiceDurationSec, setVoiceDurationSec] = useState(0);
    const [voiceError, setVoiceError] = useState('');

    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const rafRef = useRef(null);
    const maxDbRef = useRef(0);
    const recorderStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const voiceChunksRef = useRef([]);
    const voiceStartRef = useRef(0);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationText('Current Location: Unavailable');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lon: longitude });
                const label = await reverseGeocode(latitude, longitude);
                setLocationText(`Current Location: ${label}`);

                const warnings = getLoudWarningsNear(latitude, longitude, {
                    excludeUserId: user?.uid || null,
                    radiusKm: 0.5
                });
                setNearbyWarnings(warnings);
            },
            () => {
                setLocationText('Current Location: Permission denied');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );

        setRecentReports(loadCommunityReports().slice(0, 6));

        return () => {
            stopAudioMonitor();
            stopVoiceRecording();
            if (voiceClipUrl) URL.revokeObjectURL(voiceClipUrl);
        };
    }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

    const reverseGeocode = async (lat, lng) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=16&addressdetails=1`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('reverse geocode failed');
            const data = await response.json();
            const address = data?.address || {};
            const label =
                address.road ||
                address.neighbourhood ||
                address.suburb ||
                address.city_district ||
                address.city ||
                address.town ||
                address.village;

            if (label) return label;
        } catch {
            // fallback to coordinates
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    };

    const toggleTrigger = (tag) => {
        setTriggers((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
    };

    const startAudioMonitor = async () => {
        if (voiceRecording) {
            setMicError('Stop voice recording before starting dB monitor.');
            return;
        }
        try {
            setMicError('');
            maxDbRef.current = 0;
            setAudioDb(0);
            setAudioBinary(0);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const context = new AudioContext();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.fftSize);
            const tick = () => {
                analyser.getByteTimeDomainData(dataArray);
                let sumSquares = 0;
                for (let i = 0; i < dataArray.length; i += 1) {
                    const normalized = (dataArray[i] - 128) / 128;
                    sumSquares += normalized * normalized;
                }
                const rms = Math.sqrt(sumSquares / dataArray.length);
                // Approximate environmental dB mapping from signal magnitude.
                const db = Math.max(30, Math.min(100, Math.round(35 + (rms * 120))));
                if (db > maxDbRef.current) maxDbRef.current = db;
                setAudioDb(db);
                setAudioBinary(db >= AUDIO_BINARY_THRESHOLD_DB ? 1 : 0);
                rafRef.current = requestAnimationFrame(tick);
            };
            tick();
            setMicActive(true);
        } catch {
            setMicError('Microphone permission denied or unavailable.');
            stopAudioMonitor();
        }
    };

    const stopAudioMonitor = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        analyserRef.current = null;
        setMicActive(false);

        const finalDb = maxDbRef.current || audioDb;
        setAudioDb(finalDb);
        setAudioBinary(finalDb >= AUDIO_BINARY_THRESHOLD_DB ? 1 : 0);
    };

    const startVoiceRecording = async () => {
        if (micActive) {
            stopAudioMonitor();
        }
        if (voiceRecording) return;
        try {
            setVoiceError('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorderStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            voiceChunksRef.current = [];
            voiceStartRef.current = Date.now();

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    voiceChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                if (voiceChunksRef.current.length > 0) {
                    const blob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
                    if (voiceClipUrl) URL.revokeObjectURL(voiceClipUrl);
                    const nextUrl = URL.createObjectURL(blob);
                    setVoiceClipUrl(nextUrl);
                    const duration = Math.max(1, Math.round((Date.now() - voiceStartRef.current) / 1000));
                    setVoiceDurationSec(duration);
                }
                if (recorderStreamRef.current) {
                    recorderStreamRef.current.getTracks().forEach((t) => t.stop());
                    recorderStreamRef.current = null;
                }
            };

            recorder.start();
            setVoiceRecording(true);
        } catch {
            setVoiceError('Could not start voice recording. Check microphone permission.');
            stopVoiceRecording();
        }
    };

    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        } else if (recorderStreamRef.current) {
            recorderStreamRef.current.getTracks().forEach((t) => t.stop());
            recorderStreamRef.current = null;
        }
        setVoiceRecording(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (coords.lat == null || coords.lon == null) {
            setStatusMsg('Location unavailable. Allow location access and try again.');
            return;
        }

        if (micActive) {
            stopAudioMonitor();
        }
        if (voiceRecording) {
            stopVoiceRecording();
        }

        const report = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            userId: user?.uid || null,
            userEmail: user?.email || null,
            locationLabel: locationText.replace('Current Location: ', ''),
            lat: coords.lat,
            lon: coords.lon,
            calmScore: Number(calmScore),
            triggers,
            notes: notes.trim(),
            audioDb: Number(audioDb || 0),
            audioBinary: Number(audioBinary || 0), // 0 = quiet, 1 = loud
            voiceRecorded: Boolean(voiceClipUrl),
            voiceDurationSec: Number(voiceDurationSec || 0)
        };

        saveCommunityReport(report);
        setRecentReports(loadCommunityReports().slice(0, 6));
        const warnings = getLoudWarningsNear(coords.lat, coords.lon, {
            excludeUserId: user?.uid || null,
            radiusKm: 0.5
        });
        setNearbyWarnings(warnings);
        setNotes('');
        setTriggers([]);
        setStatusMsg('Report submitted. Live map and routes will use this data.');
    };

    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '10px' }}>Share Your Experience</h1>
            <p style={{ marginBottom: '20px', color: 'var(--neutral-text-light)' }}>
                Reports from this page are used in Live Map analysis and calm route calculations.
            </p>

            {nearbyWarnings.length > 0 && (
                <div className="glass-panel" style={{ padding: '14px', marginBottom: '16px', border: '1px solid rgba(243,95,95,0.4)' }}>
                    <strong style={{ color: 'var(--accent-coral-dark)' }}>Warning:</strong>{' '}
                    {nearbyWarnings.length} recent loud audio report(s) detected near your location by other users.
                </div>
            )}

            <div className="community-grid">
                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Location</label>
                            <input type="text" value={locationText} readOnly />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                                How calm is this area right now? (1-10)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span>(1)</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={calmScore}
                                    onChange={(e) => setCalmScore(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: 'var(--primary-teal)' }}
                                />
                                <span>(10)</span>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                                Score: {calmScore}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Audio dB (binary alert)</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className={micActive ? 'btn-secondary' : 'btn-primary'}
                                    onClick={micActive ? stopAudioMonitor : startAudioMonitor}
                                >
                                    {micActive ? 'Stop Mic' : 'Record Audio'}
                                </button>
                                <span style={{ fontWeight: 700 }}>{audioDb ? `${audioDb} dB` : 'No reading yet'}</span>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '10px',
                                    background: audioBinary ? 'rgba(243,95,95,0.16)' : 'rgba(28,169,127,0.16)',
                                    color: audioBinary ? '#b42323' : '#0f7a58',
                                    fontWeight: 700
                                }}>
                                    Binary: {audioBinary} ({audioBinary ? 'Loud' : 'Quiet'})
                                </span>
                            </div>
                            <div style={{ marginTop: '6px', fontSize: '.82rem', color: 'var(--neutral-text-light)' }}>
                                Binary threshold: {AUDIO_BINARY_THRESHOLD_DB} dB ({'>='} loud = 1, otherwise 0)
                            </div>
                            {micError && (
                                <div style={{ marginTop: '6px', fontSize: '.82rem', color: 'var(--accent-coral-dark)' }}>{micError}</div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Voice Clip</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className={voiceRecording ? 'btn-secondary' : 'btn-primary'}
                                    onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                                >
                                    {voiceRecording ? 'Stop Voice Rec' : 'Rec Voice'}
                                </button>
                                {voiceDurationSec > 0 && (
                                    <span style={{ fontWeight: 700 }}>{voiceDurationSec}s</span>
                                )}
                            </div>
                            {voiceClipUrl && (
                                <audio style={{ marginTop: '8px', width: '100%' }} controls src={voiceClipUrl} />
                            )}
                            {voiceError && (
                                <div style={{ marginTop: '6px', fontSize: '.82rem', color: 'var(--accent-coral-dark)' }}>{voiceError}</div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Triggers Present</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {TRIGGER_OPTIONS.map((tag) => (
                                    <label
                                        key={tag}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            background: 'var(--neutral-bg)',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            border: '1px solid var(--neutral-border)'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={triggers.includes(tag)}
                                            onChange={() => toggleTrigger(tag)}
                                        />
                                        {tag}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Notes</label>
                            <textarea
                                rows="3"
                                placeholder="Any additional details..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                            Submit Report
                        </button>
                        {statusMsg && (
                            <div style={{ fontSize: '.9rem', color: 'var(--primary-teal-dark)' }}>{statusMsg}</div>
                        )}
                    </form>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Upload Scene Video</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-text-light)' }}>
                                Video helps improve contextual analysis with your text and audio report.
                            </p>
                        </div>
                        <VideoUpload />
                    </div>

                    <div className="glass-panel" style={{ padding: '18px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Recent Community Reports</h3>
                        {recentReports.length === 0 ? (
                            <p style={{ color: 'var(--neutral-text-light)' }}>No reports yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {recentReports.map((item) => (
                                    <div key={item.id} className="card" style={{ padding: '10px' }}>
                                        <div style={{ fontSize: '.9rem', fontWeight: 700 }}>{item.locationLabel}</div>
                                        <div style={{ fontSize: '.82rem', color: 'var(--neutral-text-light)' }}>
                                            Calm {Number(item.calmScore || 0).toFixed(1)} / 10 | Audio Binary {Number(item.audioBinary || 0)}{item.voiceRecorded ? ` | Voice ${Number(item.voiceDurationSec || 0)}s` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .community-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 18px;
                }

                @media (max-width: 980px) {
                    .community-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
