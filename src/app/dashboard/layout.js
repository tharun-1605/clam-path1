'use client';

import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '300px', // Space for fixed sidebar
                padding: '2.5vh 30px 2.5vh 0', // Padding to match sidebar margin
                position: 'relative'
            }}>
                {children}
            </main>
        </div>
    );
}
