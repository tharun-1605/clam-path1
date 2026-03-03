'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, BarChart, Compass } from 'lucide-react';

export default function QuickActionGrid() {
    const actions = [
        {
            label: 'Panic Mode',
            href: '/panic',
            icon: <AlertCircle size={32} />,
            color: 'var(--accent-coral)',
            bg: 'rgba(243, 95, 95, 0.08)',
            border: 'rgba(243, 95, 95, 0.2)'
        },
        {
            label: 'Report',
            href: '/dashboard/community',
            icon: <FileText size={32} />,
            color: 'var(--primary-teal)',
            bg: 'rgba(0, 168, 168, 0.08)',
            border: 'rgba(0, 168, 168, 0.2)'
        },
        {
            label: 'Travel History',
            href: '/dashboard/history',
            icon: <BarChart size={32} />,
            color: 'var(--secondary-amber-dark)',
            bg: 'rgba(220, 142, 8, 0.08)',
            border: 'rgba(220, 142, 8, 0.2)'
        },
        {
            label: 'Calm Routes',
            href: '/dashboard/routes',
            icon: <Compass size={32} />,
            color: 'var(--primary-teal-dark)',
            bg: 'rgba(6, 122, 122, 0.08)',
            border: 'rgba(6, 122, 122, 0.2)'
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {actions.map((action, idx) => (
                <Link key={idx} href={action.href} style={{ textDecoration: 'none' }}>
                    <motion.button
                        whileHover={{ y: -4, boxShadow: '0 12px 20px rgba(0,0,0,0.05)' }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            width: '100%',
                            height: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            background: 'white',
                            border: `1px solid ${action.border}`,
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: '16px'
                        }}
                    >
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: action.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: action.color,
                            transition: 'transform 0.2s ease'
                        }}>
                            {action.icon}
                        </div>
                        <span style={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: 'var(--neutral-text)',
                            letterSpacing: '-0.3px'
                        }}>
                            {action.label}
                        </span>
                    </motion.button>
                </Link>
            ))}
        </div>
    );
}
