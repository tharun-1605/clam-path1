# Neuro-Nav: Sensory-Safe City Navigation

Neuro-Nav is a Next.js-based web application designed to help neurodivergent individuals navigate urban environments with confidence by prioritizing sensory-safe routes and providing real-time data on noise, crowds, and "Safe Havens."

## 🚀 Mission
To provide "Calm Routes for Mindful Journeys," avoiding sensory overload through data-driven navigation and instant access to supportive tools.

## 🛠 Technology Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google Provider)
- **UI & Animations**: [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Maps**: Google Maps (Embed API & JS API)
- **Data Source**: [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) (for calculating Calm Scores)
- **Styling**: Vanilla CSS (CSS Variables & Glassmorphism)

## 📂 Project Structure
- `src/app/`: Next.js App Router pages.
  - `page.js`: Landing page.
  - `login/`: Firebase-powered authentication.
  - `onboarding/` & `profile-setup/`: User personalization.
  - `dashboard/`: Main application interface.
  - `panic/`: Fullscreen emergency/panic mode.
- `src/components/`: Reusable UI components.
  - `AuthContext.js`: Global user state.
  - `ThemeContext.js`: Visual appearance management.
  - `MapComponent.js` & `SafeHavensPreview.js`: Core navigation features.
  - `MusicPlayer.js`: Sensory soothing tool.
- `src/lib/`: Core utilities and configurations.
  - `firebase.js`: Firebase SDK initialization.
- `src/styles/`: Global styles and design system.

## ✨ Core Features
1. **Sensory-Safe Routing**: Prioritizes quiet streets and low-impact paths.
2. **Real-Time Calm Scores**: Live assessment of areas based on proximity to parks, libraries, and quiet spots.
3. **Safe Havens**: A curated list of verified quiet spaces for immediate sensory relief.
4. **Panic Mode**: A one-tap emergency interface that triggers calming visuals and audio or directs the user to the nearest Safe Haven.
5. **Mental Health Tools**: Built-in soothing music player and sensory analysis tools.

## 🔑 Key Configurations
- **Firebase**: Configured in `src/lib/firebase.js`.
- **Google Maps**: Uses the `@react-google-maps/api` but switches to frames for specific dashboard views.
