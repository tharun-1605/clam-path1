'use client';

import { motion } from 'framer-motion';

export default function MusicPlayer() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
                padding: '0',
                overflow: 'hidden',
                marginTop: '20px',
                borderRadius: '16px'
            }}
        >
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🎵</span> Soothing Sounds
                </h3>
            </div>
            <iframe
                style={{ borderRadius: '0', marginBottom: '-5px', minHeight: '152px', display: 'block' }}
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0"
                width="100%"
                height="152px"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
        </motion.div>
    );
}
