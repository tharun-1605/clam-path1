import '../styles/globals.css';
import { AuthProvider } from '../components/AuthContext';
import { ThemeProvider } from '../components/ThemeContext';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap'
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap'
});

export const metadata = {
    title: 'Neuro-Nav',
    description: 'Sensory-safe city navigation',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}>
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
