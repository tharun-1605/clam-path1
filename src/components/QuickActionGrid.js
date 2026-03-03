'use client';

import Link from 'next/link';
import { AlertTriangle, Camera, BarChart3, Map } from 'lucide-react';

export default function QuickActionGrid() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <Link href="/panic">
                <button className="glass-button" style={{
                    width: '100%', padding: '20px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px', height: '130px', justifyContent: 'center',
                    background: 'rgba(255, 107, 107, 0.1)', border: '1px solid var(--accent-coral)'
                }}>
                    <AlertTriangle size={36} color="var(--accent-coral)" />
                    <span style={{ fontWeight: 600, color: 'var(--accent-coral)' }}>Panic Mode</span>
                </button>
            </Link>

            <Link href="/dashboard/community">
                <button className="glass-button" style={{
                    width: '100%', padding: '20px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px', height: '130px', justifyContent: 'center'
                }}>
                    <Camera size={36} className="text-primary-teal" />
                    <span style={{ fontWeight: 600 }}>Report</span>
                </button>
            </Link>

            <Link href="/dashboard/history">
                <button className="glass-button" style={{
                    width: '100%', padding: '20px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px', height: '130px', justifyContent: 'center'
                }}>
                    <BarChart3 size={36} className="text-secondary-lavender" />
                    <span style={{ fontWeight: 600 }}>Stats</span>
                </button>
            </Link>

            <Link href="/dashboard/routes">
                <button className="glass-button" style={{
                    width: '100%', padding: '20px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px', height: '130px', justifyContent: 'center'
                }}>
                    <Map size={36} className="text-primary-teal" />
                    <span style={{ fontWeight: 600 }}>Plan Trip</span>
                </button>
            </Link>
        </div>
    );
}
