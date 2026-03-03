'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const steps = [
    {
        id: 1,
        title: "Understanding Your Needs",
        desc: "We understand that crowded spaces and loud noises can feel overwhelming. Neuro-Nav is designed to give you control back.",
        icon: "🧠"
    },
    {
        id: 2,
        title: "How It Works",
        desc: "Our AI analyzes real-time city data to find 'Calm Routes'. Visualization tools help you plan journeys that respect your sensory boundaries.",
        icon: "🗺️"
    },
    {
        id: 3,
        title: "Your Privacy Matters",
        desc: "Your location data stays on your device. Community contributions are anonymous. You are in full control of what you share.",
        icon: "🛡️"
    }
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-bg)', padding: '20px' }}>

            <div style={{ width: '100%', maxWidth: '500px' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
                    {steps.map((_, idx) => (
                        <div key={idx} style={{
                            height: '6px', width: '40px', borderRadius: '4px',
                            background: idx === currentStep ? 'var(--primary-teal)' : 'var(--neutral-border)',
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>

                {/* Card */}
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ fontSize: '5rem', marginBottom: '30px' }}>
                                {steps[currentStep].icon}
                            </div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--primary-teal-dark)' }}>
                                {steps[currentStep].title}
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--neutral-text-light)', lineHeight: 1.6 }}>
                                {steps[currentStep].desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={prevStep}
                        className="btn-secondary"
                        style={{ opacity: currentStep === 0 ? 0.5 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
                    >
                        Back
                    </button>

                    {currentStep === steps.length - 1 ? (
                        <Link href="/profile-setup">
                            <button className="btn-primary">
                                Create Profile
                            </button>
                        </Link>
                    ) : (
                        <button onClick={nextStep} className="btn-primary">
                            Next Step
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
