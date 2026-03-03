'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--neutral-bg)', overflow: 'hidden' }}>

            {/* Navbar */}
            <nav className="glass-panel" style={{
                position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
                width: '90%', maxWidth: '1200px', padding: '15px 30px', zIndex: 100,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px' }} className="text-gradient">
                    Neuro-Nav
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link href="/login">
                        <button className="btn-secondary" style={{ padding: '8px 20px' }}>Login</button>
                    </Link>
                    <Link href="/onboarding">
                        <button className="btn-primary" style={{ padding: '8px 25px' }}>Get Started</button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', padding: '0 20px'
            }}>
                {/* Abstract Background Blobs */}
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'var(--primary-teal-light)', filter: 'blur(80px)', opacity: 0.3, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'var(--secondary-lavender)', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%' }} />

                <div className="container-max" style={{ textAlign: 'center', zIndex: 1, maxWidth: '800px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '20px' }}>
                            Calm Routes for <br />
                            <span className="text-gradient">Mindful Journeys</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--neutral-text-light)', marginBottom: '40px', lineHeight: 1.6 }}>
                            Navigate the city with confidence. avoidance sensory overload with real-time noise data, crowd avoidance, and instant safe havens.
                        </p>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/onboarding">
                                <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                                    Start Your Journey
                                </button>
                            </Link>
                            <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                                Learn More
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Preview */}
            <section style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.5)' }}>
                <div className="container-max">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <FeatureCard
                            icon="🧠"
                            title="Sensory-Safe Routing"
                            desc="AI-powered routes that prioritize quiet streets and low sensory impact over speed."
                        />
                        <FeatureCard
                            icon="📊"
                            title="Real-Time Calm Scores"
                            desc="Know before you go. Live data on noise levels, lighting, and crowd density."
                        />
                        <FeatureCard
                            icon="🌳"
                            title="Emergency Safe Havens"
                            desc="Instant access to verified quiet spaces like parks and libraries when you need a break."
                        />
                    </div>
                </div>
            </section>

        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card"
            style={{ textAlign: 'center', padding: '40px 20px' }}
        >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{icon}</div>
            <h3 style={{ marginBottom: '15px' }}>{title}</h3>
            <p style={{ color: 'var(--neutral-text-light)' }}>{desc}</p>
        </motion.div>
    )
}
