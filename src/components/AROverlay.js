'use client';

import { motion } from 'framer-motion';

export default function AROverlay({ active }) {
    if (!active) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 15,
            pointerEvents: 'none',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '4px solid #f43f5e'
        }}>
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#f43f5e',
                    textShadow: '0 0 10px white'
                }}
            >
                FOLLOW ARROWS TO SAFETY
            </motion.div>

            {/* Simulated Arrows */}
            <motion.div
                animate={{ x: [0, 50, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '20%',
                    fontSize: '4rem',
                    color: '#38bdf8'
                }}
            >
                ➔
            </motion.div>
        </div>
    );
}
