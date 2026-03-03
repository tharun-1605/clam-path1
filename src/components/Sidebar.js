'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext'; // Import hook
import { LogOut, Map, Navigation, Settings, User, Moon, Sun, Shield, Heart, History, AlertCircle } from 'lucide-react'; // Import icons

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme(); // Use hook

    const navItems = [
        { name: 'Live Map', href: '/dashboard', icon: Map },
        { name: 'Routes', href: '/dashboard/routes', icon: Navigation },
        { name: 'Safe Havens', href: '/dashboard/safe-havens', icon: Shield },
        { name: 'Community', href: '/dashboard/community', icon: Heart },
        { name: 'History', href: '/dashboard/history', icon: History },
        { name: 'Panic Mode', href: '/panic', icon: AlertCircle },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel"
            style={{
                width: '240px',
                height: '95vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                borderRadius: '20px',
                overflowY: 'auto' // Allow scrolling if list is long
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', paddingLeft: '5px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-teal), var(--secondary-lavender))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
                }}>
                    N
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }} className="text-gradient">
                    Neuro-Nav
                </h1>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                            }}>
                                <item.icon size={20} />
                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span style={{ fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        marginTop: '10px'
                    }}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: 500 }}>Log Out</span>
                </button>
            </div>
        </motion.div>
    );
}
