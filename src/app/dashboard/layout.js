'use client';

import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '2.5vh', // Symmetrical padding for floating look
            gap: '2.5vh'      // Consistent gap between sidebar and content
        }}>
            <Sidebar />
            <main style={{
                flex: 1,
                padding: '0 30px',
                position: 'relative',
                overflowY: 'auto',
                height: '95vh'    // Aligns with Sidebar height
            }}>
                {children}
            </main>
        </div>
    );
}
