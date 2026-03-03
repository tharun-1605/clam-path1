# Neuro-Nav 🧭

**Calm Routes for Mindful Journeys**

Navigate the city with confidence. Avoid sensory overload with real-time noise data, crowd avoidance, and instant safe havens.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Key Components](#key-components)
- [Configuration](#configuration)
- [Mobile Development](#mobile-development)
- [Contributing](#contributing)
- [License](#license)

---

## About

Neuro-Nav is an innovative navigation application designed for neurodivergent individuals and those with sensory sensitivities. The platform provides real-time environmental data, including noise levels, crowd density, and sensory-friendly locations (safe havens), enabling users to plan routes that minimize sensory overload.

With features like AR-enhanced walking directions, mood tracking, community insights, and personalized sensory profiles, Neuro-Nav transforms urban navigation into a mindful and accessible experience.

---

## Features

### 🗺️ Smart Navigation
- Real-time sensory heatmap visualization
- AR-enhanced walking directions
- Crowd avoidance algorithms
- Route optimization for sensory comfort

### 🏥 Safe Havens
- Discover sensory-friendly locations nearby
- Filter by amenities and accessibility features
- Community-verified safe spaces
- Real-time availability status

### 📊 Analytics & Insights
- Personal calm score tracking
- Sensory trigger identification
- Route history and preferences
- Community analytics dashboard

### 🧠 Personalization
- Customizable sensory profiles (Sensory Passport)
- Mood journal for tracking patterns
- Quiet hours scheduling
- Theme customization (light/dark mode)

### 👥 Community Features
- Share safe routes with others
- Report problematic areas
- Community voting on locations
- Buddy system for navigation

### 🎤 Accessibility
- Voice command navigation
- Hands-free operation
- Accessibility audit tools
- Multi-sensory feedback options

### 📱 Mobile Support
- Native iOS/Android app shell
- Offline storage capabilities
- Push notifications
- Mobile-optimized UI

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4.2.1, PostCSS
- **Animation:** Framer Motion 12.23.26
- **Icons:** Lucide React 0.562.0

### Maps & Location
- **Google Maps:** @react-google-maps/api 2.20.8
- **Leaflet Maps:** react-leaflet 5.0.0, leaflet 1.9.4

### Backend & Services
- **Firebase:** 12.7.0 (Authentication, Database, Storage)
- **Google APIs:** googleapis 169.0.0

### Build Tools
- **Package Manager:** npm
- **CSS Framework:** Tailwind CSS with PostCSS

---

## Project Structure

```
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── api/                      # API routes
│   │   │   ├── analyze-video/        # Video analysis endpoint
│   │   │   └── sensory-data/         # Sensory data processing
│   │   ├── dashboard/                # Dashboard pages
│   │   │   ├── analytics/            # Analytics dashboard
│   │   │   ├── community/            # Community features
│   │   │   ├── history/              # Route history
│   │   │   ├── map/                  # Interactive maps
│   │   │   ├── profile/              # User profile
│   │   │   ├── routes/               # Saved routes
│   │   │   ├── safe-havens/          # Safe havens management
│   │   │   │── settings/             # User settings
│   │   │   │   └── quiet-hours/      # Quiet hours config
│   │   ├── login/                    # Authentication
│   │   ├── onboarding/               # Onboarding flow
│   │   ├── panic/                    # Emergency panic button
│   │   ├── profile-setup/            # Profile initialization
│   │   ├── layout.js                 # Root layout
│   │   └── page.js                   # Landing page
│   ├── components/                   # Reusable components
│   │   ├── AnalyticsCard.js          # Analytics display
│   │   ├── AROverlay.js              # AR visualization
│   │   ├── ARWalking.js              # AR walking directions
│   │   ├── AuthContext.js            # Auth provider
│   │   ├── CalmScoreHeader.js        # Calm score display
│   │   ├── GoogleMapDisplay.js       # Google Maps wrapper
│   │   ├── InteractiveMap.js         # Interactive map interface
│   │   ├── LeafletMapDisplay.js      # Leaflet maps wrapper
│   │   ├── MapComponent.js           # Map component base
│   │   ├── MusicPlayer.js            # Music/sound player
│   │   ├── PanicButton.js            # Emergency button
│   │   ├── QuickActionGrid.js        # Quick action buttons
│   │   ├── ReportTrigger.js          # Report interface
│   │   ├── RouteMapDisplay.js        # Route visualization
│   │   ├── SafeHavensPreview.js      # Safe havens preview
│   │   ├── SensoryHeatmap.js         # Sensory data heatmap
│   │   ├── SensoryPassportHeader.js  # Header component
│   │   ├── SensoryPassportSidebar.js # Navigation sidebar
│   │   ├── SensoryStatusCard.js      # Status indicator
│   │   ├── Sidebar.js                # Main sidebar
│   │   ├── StatisticsGrid.js         # Statistics display
│   │   ├── ThemeContext.js           # Theme provider
│   │   ├── ThemeProvider.js          # Theme wrapper
│   │   ├── VideoUpload.js            # Video upload component
│   │   └── ...
│   ├── lib/                          # Utility libraries
│   │   ├── accessibilityAudit.js     # Accessibility checks
│   │   ├── analyticsExport.js        # Analytics export utilities
│   │   ├── buddy.js                  # Buddy system logic
│   │   ├── deploymentGuide.js        # Deployment docs
│   │   ├── designTokens.js           # Design system tokens
│   │   ├── firebase.js               # Firebase configuration
│   │   ├── livechat.js               # Live chat integration
│   │   ├── mobileAppShell.js         # Mobile app wrapper
│   │   ├── mobileNavigationSetup.js  # Mobile routing
│   │   ├── moodJournal.js            # Mood tracking utilities
│   │   ├── notifications.js          # Push notifications
│   │   ├── offlinStorage.js          # Offline capabilities
│   │   ├── partnerships.js           # Partner integration
│   │   ├── predictive.js             # Predictive analytics
│   │   ├── projectSummary.js         # Project documentation
│   │   ├── routeApi.js               # Route API client
│   │   ├── sensoryDesignSystem.js    # Design system
│   │   ├── threatDetection.js        # Safety detection
│   │   ├── voiceCommands.js          # Voice control
│   │   ├── voting.js                 # Voting system
│   │   └── ...
│   └── styles/
│       └── globals.css               # Global styles
├── public/
│   └── sw.js                         # Service worker
├── android/                          # Android app files
│   ├── AndroidManifest.xml
│   ├── MainActivity.kt
│   └── ...
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── jsconfig.json                     # JavaScript config
└── package.json                      # Dependencies
```

---

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account setup

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hackathon\ Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Copy your Firebase configuration
   - Update `src/lib/firebase.js` with your credentials

4. **Set up environment variables**
   - Create a `.env.local` file in the project root
   - Add necessary API keys and configurations:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
     ```

---

## Getting Started

### Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

### Linting

Check code quality:
```bash
npm run lint
```

---

## Usage

### Landing Page
- First-time visitors land on the home page with "Get Started" and "Login" options

### Onboarding Flow
- New users complete the onboarding to set up their sensory profile
- Configure preferences and accessibility settings

### Dashboard
The main hub after login, featuring:
- **Map View:** Interactive map with sensory heatmap overlay
- **Analytics:** Personal calm scores and sensory triggers
- **Safe Havens:** Nearby sensory-friendly locations
- **History:** Track visited routes and patterns
- **Community:** Connect with other users and share insights
- **Profile:** Manage user settings and preferences

### Navigation
- Select start and end points on the map
- View sensory-optimized route suggestions
- Use AR overlay for walking directions
- Adjust route preferences in real-time

### Panic Button
- Quick access emergency button on all pages
- Triggers alerts and connects to support

---

## API Routes

### Video Analysis
- **Endpoint:** `/api/analyze-video`
- **Purpose:** Process and analyze uploaded video for sensory content
- **Method:** POST

### Sensory Data
- **Endpoint:** `/api/sensory-data`
- **Purpose:** Fetch and process real-time sensory information
- **Method:** GET/POST

---

## Key Components

### Authentication (`AuthContext.js`)
Manages user authentication state and login/logout operations.

### Theme Management (`ThemeContext.js` & `ThemeProvider.js`)
Handles light/dark theme switching and design token application.

### Maps (`GoogleMapDisplay.js`, `LeafletMapDisplay.js`)
Provides map visualization with integrated sensory data overlays.

### Sensory Heatmap (`SensoryHeatmap.js`)
Visualizes noise levels, crowd density, and environmental factors.

### Safe Havens Preview (`SafeHavensPreview.js`)
Displays nearby sensory-friendly locations with details and ratings.

### AR Components (`AROverlay.js`, `ARWalking.js`)
Augmented reality features for enhanced navigation experience.

### Analytics (`AnalyticsCard.js`, `StatisticsGrid.js`)
Displays user analytics, trends, and insights.

---

## Configuration

### Design System
Edit `src/lib/designTokens.js` to customize:
- Colors and gradients
- Typography
- Spacing
- Component styles

### Tailwind CSS
Customize styling in `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
    },
  },
}
```

---

## Mobile Development

### iOS/Android Support
- Mobile app shell configured in `src/lib/mobileAppShell.js`
- Native app wrappers in `/android` directory
- Responsive design optimized for mobile viewports

### Service Worker
- Located at `public/sw.js`
- Enables offline functionality
- Handles push notifications

### Mobile Navigation
- Configured in `src/lib/mobileNavigationSetup.js`
- Touch-optimized UI components
- Mobile-specific routing

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

For bugs, feature requests, or questions:
- Open an issue on the repository
- Contact the development team
- Check documentation in `src/lib/deploymentGuide.js`

---

## License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## Acknowledgments

Built with ❤️ for the neurodivergent community and individuals with sensory sensitivities.

**Vision:** Creating accessible, inclusive urban spaces where everyone can navigate with confidence and calm.

---

**Last Updated:** March 2026