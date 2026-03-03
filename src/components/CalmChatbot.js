'use client';

import { useState } from 'react';

const PRESET_ACTIONS = [
    'I feel anxious right now. Give me a fast calming plan.',
    'Suggest calm audio for panic and sensory overload.',
    'Give me a 2-minute breathing exercise now.',
    'I am overwhelmed in a crowded place. What should I do?',
    'Suggest bedtime calm audio and relaxation steps.'
];

export default function CalmChatbot({ location = 'Unknown', calmScore = 5 }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Choose an option below. I will suggest calming audio and quick support steps.'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [followUps, setFollowUps] = useState([]);

    const sendMessage = async (text) => {
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await fetch('/api/calm-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    location,
                    calmScore
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Chat request failed');
            }

            const lines = [];
            if (data.reply) lines.push(data.reply);
            if (Array.isArray(data.audioSuggestions) && data.audioSuggestions.length) {
                lines.push(`Calm audio ideas: ${data.audioSuggestions.join(' | ')}`);
                setFollowUps(data.audioSuggestions.slice(0, 3).map((s) => `Give me details for: ${s}`));
            } else {
                setFollowUps([]);
            }
            if (data.exercise) lines.push(`Quick exercise: ${data.exercise}`);

            setMessages((prev) => [...prev, { role: 'assistant', text: lines.join('\n') }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'assistant', text: `Sorry, chat failed: ${err.message}` }]);
            setFollowUps([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '14px' }}>
            <h3 style={{ marginBottom: '8px' }}>Calm Support Chat</h3>
            <div style={{ fontSize: '.8rem', color: 'var(--neutral-text-light)', marginBottom: '8px' }}>
                Location: {location} | Calm Score: {Number(calmScore || 0).toFixed(1)}
            </div>

            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'grid', gap: '8px', marginBottom: '10px' }}>
                {messages.map((m, idx) => (
                    <div
                        key={`${m.role}-${idx}`}
                        style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: m.role === 'user' ? 'rgba(0,168,168,0.12)' : 'rgba(0,0,0,0.04)',
                            whiteSpace: 'pre-wrap',
                            fontSize: '.88rem'
                        }}
                    >
                        <strong>{m.role === 'user' ? 'You' : 'CalmBot'}:</strong> {m.text}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ fontSize: '.8rem', color: 'var(--neutral-text-light)' }}>Quick options</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {PRESET_ACTIONS.map((action) => (
                        <button
                            key={action}
                            type="button"
                            className="btn-secondary"
                            style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '.86rem' }}
                            disabled={loading}
                            onClick={() => sendMessage(action)}
                        >
                            {action}
                        </button>
                    ))}
                </div>

                {followUps.length > 0 && (
                    <>
                        <div style={{ fontSize: '.8rem', color: 'var(--neutral-text-light)', marginTop: '6px' }}>Follow-up</div>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            {followUps.map((action) => (
                                <button
                                    key={action}
                                    type="button"
                                    className="btn-primary"
                                    style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '.84rem' }}
                                    disabled={loading}
                                    onClick={() => sendMessage(action)}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
