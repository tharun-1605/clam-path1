'use client';

import { useState } from 'react';

export default function CalmChatbot({ location = 'Unknown', calmScore = 5 }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Hi, I can suggest calming audio and quick grounding steps. Tell me how you feel right now.'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
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
            }
            if (data.exercise) lines.push(`Quick exercise: ${data.exercise}`);

            setMessages((prev) => [...prev, { role: 'assistant', text: lines.join('\n') }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'assistant', text: `Sorry, chat failed: ${err.message}` }]);
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

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for calm audio or support..."
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}
