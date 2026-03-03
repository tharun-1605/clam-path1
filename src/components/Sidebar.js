'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { AlertCircle, History, LogOut, Map, Moon, Navigation, Settings, Shield, Sun, User, X, Heart, MessageCircle } from 'lucide-react';

export default function Sidebar({ onNavigate, onClose, mobile = false }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { name: 'Live Map', href: '/dashboard', icon: Map },
        { name: 'Routes', href: '/dashboard/routes', icon: Navigation },
        { name: 'Safe Havens', href: '/dashboard/safe-havens', icon: Shield },
        { name: 'Community', href: '/dashboard/community', icon: Heart },
        { name: 'Calm Chat', href: '/dashboard/calm-chat', icon: MessageCircle },
        { name: 'History', href: '/dashboard/history', icon: History },
        { name: 'Panic Mode', href: '/panic', icon: AlertCircle },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings }
    ];

    return (
        <motion.aside
            initial={{ x: mobile ? -16 : -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '18px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary-teal), var(--secondary-amber))',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900
                    }}>
                        N
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '1.22rem', fontWeight: 800 }}>
                        Neuro-Nav
                    </h1>
                </div>
                {mobile && (
                    <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 10px' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <nav style={{ flex: 1, display: 'grid', gap: '8px' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} onClick={onNavigate}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '11px',
                                    padding: '11px 12px',
                                    borderRadius: '12px',
                                    border: `1px solid ${isActive ? 'rgba(0, 168, 168, 0.45)' : 'transparent'}`,
                                    background: isActive ? 'rgba(0, 168, 168, 0.12)' : 'transparent',
                                    color: isActive ? 'var(--primary-teal-dark)' : 'var(--neutral-text-light)',
                                    transition: 'all .18s ease'
                                }}
                            >
                                <item.icon size={18} />
                                <span style={{ fontSize: '.95rem', fontWeight: 600 }}>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                <button type="button" onClick={toggleTheme} className="btn-secondary" style={{ justifyContent: 'flex-start' }}>
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                </button>
                <button
                    type="button"
                    onClick={logout}
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: 'var(--accent-coral-dark)' }}
                >
                    <LogOut size={16} />
                    Log Out
                </button>
            </div>
        </motion.aside>
    );
}
