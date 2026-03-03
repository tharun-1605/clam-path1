'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

export default function VideoUpload() {
    const [analyzing, setAnalyzing] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzing(true);
        // Simulate Gemini API call
        setTimeout(() => {
            setAnalyzing(false);
            alert("Video Analyzed! Sensory Data Updated: Construction noise detected.");
        }, 2000);
    };

    return (
        <motion.div
            className="glass-panel"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', background: 'transparent', border: 'none', boxShadow: 'none' }}
        >
            <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                <Upload size={16} />
                {analyzing ? 'Analyzing...' : 'Report Sensory Trigger'}
            </label>
            <input
                id="video-upload"
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleUpload}
                disabled={analyzing}
            />
        </motion.div>
    );
}
