'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const hideScrollbar = pathname === '/dashboard' || pathname === '/dashboard/history';

    return (
        <div className="dashboard-shell">
            <aside className="desktop-sidebar">
                <Sidebar />
            </aside>

            <div className="dashboard-main-wrap">
                <header className="mobile-topbar glass-panel">
                    <button type="button" className="btn-secondary" onClick={() => setMobileOpen(true)} style={{ padding: '10px 12px' }}>
                        <Menu size={17} />
                        Menu
                    </button>
                    <h2 className="text-gradient" style={{ fontSize: '1.05rem', fontWeight: 800 }}>Neuro-Nav</h2>
                </header>

                <main className={`dashboard-main glass-panel ${hideScrollbar ? 'no-scrollbar' : ''}`}>
                    {children}
                </main>
            </div>

            {mobileOpen && (
                <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
                    <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
                        <Sidebar
                            mobile
                            onClose={() => setMobileOpen(false)}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </div>
                </div>
            )}

            <style jsx>{`
                .dashboard-shell {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 280px minmax(0, 1fr);
                    gap: 16px;
                    padding: 16px;
                }

                .desktop-sidebar {
                    height: calc(100vh - 32px);
                    position: sticky;
                    top: 16px;
                }

                .dashboard-main-wrap {
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .mobile-topbar {
                    display: none;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                }

                .dashboard-main {
                    flex: 1;
                    min-height: calc(100vh - 32px);
                    padding: 14px;
                    overflow: auto;
                }

                .mobile-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(4, 10, 24, 0.52);
                    z-index: 60;
                    display: flex;
                }

                .mobile-sidebar {
                    width: min(88vw, 320px);
                    height: 100%;
                    padding: 12px;
                }

                @media (max-width: 1024px) {
                    .dashboard-shell {
                        grid-template-columns: 1fr;
                        padding: 10px;
                        gap: 10px;
                    }

                    .desktop-sidebar {
                        display: none;
                    }

                    .mobile-topbar {
                        display: flex;
                    }

                    .dashboard-main {
                        min-height: calc(100vh - 88px);
                        padding: 10px;
                    }
                }
            `}</style>
        </div>
    );
}
