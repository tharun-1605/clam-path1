'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PanicButton() {
    const router = useRouter();

    const handlePanic = () => {
        router.push('/panic');
    };

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="panic-button-container"
            style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 20 }}
        >
            <button
                className="btn-panic"
                onClick={handlePanic}
                aria-label="Find Safe Haven Immediately"
            >
                SOS
            </button>
        </motion.div>
    );
}
