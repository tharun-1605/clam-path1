# 🧠 Neuro-Nav: Calm Routes for Mindful Journeys

[![Google Cloud Platform](https://img.shields.io/badge/Hosted%20on-Google%20Cloud%20Platform-red?style=flat-square&logo=google-cloud)](https://neuro-nav-327583870558.us-central1.run.app/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Powered%20by-React-61DAFB?style=flat-square&logo=react)](https://react.dev/)

> **Navigate the city with confidence.** Neuro-Nav helps individuals avoid sensory overload with real-time noise data, crowd avoidance alerts, and instant safe haven recommendations.

---

## 🎯 About Neuro-Nav

Neuro-Nav is an intelligent navigation and wellness application designed for individuals with sensory sensitivities, autism spectrum disorder (ASD), anxiety disorders, and anyone seeking a calmer urban experience. The app combines real-time sensory data analysis, AI-powered recommendations, and community insights to create personalized, stress-free navigation routes.

### Problem Statement
Urban environments can be overwhelming due to excessive noise, bright lights, and crowded spaces. People with sensory sensitivities struggle to navigate cities comfortably. Neuro-Nav bridges this gap by providing real-time sensory data and intelligent route recommendations.

### Solution
A comprehensive multi-platform application that:
- **Analyzes sensory conditions** (noise, light, crowd levels) in real-time
- **Recommends safe routes** using AI and historical data
- **Locates safe havens** (quiet parks, libraries, sensory-friendly spaces)
- **Provides emergency support** with SOS panic button functionality
- **Builds community** through shared sensory data and reviews

---

## 🌐 Live Deployments

### Web Applications

| Platform | URL | Type |
|----------|-----|------|
| **Main Application** | [neuro-nav-327583870558.us-central1.run.app](https://neuro-nav-327583870558.us-central1.run.app/) | Google Cloud Platform (GCP) |
| **Widescreen Dashboard** | [neuronavwidescreen.vercel.app](https://neuronavwidescreen.vercel.app/dashboard) | Vercel (Tab Version) |

### Mobile Applications

| Platform | Link | Type |
|----------|------|------|
| **Android APK** | [Download v1.0.0](https://github.com/Dharaneesh20/Neuro-Nav-App/releases/tag/v1.0.0) | Mobile App |
| **App Repository** | [GitHub - Neuro-Nav-App](https://github.com/Dharaneesh20/Neuro-Nav-App) | Source Code |

### Tablet Version

| Device | URL | Repository |
|--------|-----|-----------|
| **iPad/Tablet** | [neuronavwidescreen.vercel.app](https://neuronavwidescreen.vercel.app/dashboard) | [Neuro-Nav-Tab](https://github.com/Dharaneesh20/Neuro-Nav-Tab) |

---

## ✨ Key Features

### 🗺️ Intelligent Navigation
- Real-time sensory data integration (noise levels, crowd density, light intensity)
- AI-powered route optimization avoiding sensory triggers
- Interactive map with safe haven markers
- GPS-based location tracking

### 🆘 Emergency Support
- **SOS Panic Button** - Instant access to safe havens
- AR overlay guidance to nearest safe location
- Emergency contact integration
- Crisis resource hotlines

### 🎵 Wellness Tools
- **Soothing Sounds Integration** - Spotify playlist integration for calming audio
- **Sensory Profiles** - Personalized sensitivity settings
- **Mood Tracking** - Calm score visualization (0-10 scale)
- **History & Analytics** - Track routes and sensory experiences

### 🏘️ Safe Haven Discovery
- **Community-Vetted Locations** - Libraries, parks, quiet cafes
- **Location Reviews & Ratings** - Detailed sensory feedback from community
- **Real-time Availability** - Check current crowd levels
- **Route Sharing** - Share peaceful routes with community

### 📊 Data-Driven Insights
- Real-time sensory data collection from Google Sheets
- AI video analysis for local sensory conditions
- Trend analysis and recommendations
- Community contributions and feedback

### 👥 Community Features
- Share sensory-friendly routes
- Report problematic areas
- Rate locations and havens
- Community leaderboard (sensory advocates)

### 🎨 User Experience
- **Dark/Light Theme Support** - Accessibility focus
- **Responsive Design** - PC optimized, tablet-friendly
- **Glassmorphism UI** - Modern, accessible interface
- **Smooth Animations** - Framer Motion powered interactions

---

## 🛠️ Technology Stack

### Frontend
```
Next.js 16.1.1          - React framework with SSR
React 19.2.3            - UI library
Framer Motion 12.23.26  - Animation library
React Google Maps API   - Map integration
Lucide React 0.562.0    - Icon library
```

### Backend & Services
```
Firebase 12.7.0         - Authentication & Analytics
Google APIs 169.0.0     - Maps, Sheets, and Generative AI
Google Gemini AI        - Video analysis and recommendations
Google Sheets           - Real-time sensory data storage
Google Cloud Platform   - Hosting & deployment
```

### Development Tools
```
Node.js                 - Runtime
npm                     - Package management
ESLint                  - Code quality
Next.js Build System    - Optimization & bundling
```

---

## 📁 Project Structure

```
Neuro-Nav-App/
│
├── src/
│   ├── app/
│   │   ├── page.js                    # Landing page
│   │   ├── layout.js                  # Root layout
│   │   ├── login/                     # Authentication
│   │   ├── onboarding/                # User setup
│   │   ├── dashboard/                 # Main dashboard hub
│   │   │   ├── page.js
│   │   │   ├── safe-havens/           # Safe location discovery
│   │   │   ├── history/               # Route history
│   │   │   ├── profile/               # User settings
│   │   │   ├── community/             # Community features
│   │   │   └── settings/              # App configuration
│   │   ├── panic/                     # SOS emergency page
│   │   ├── profile-setup/             # Initial profile creation
│   │   └── api/
│   │       ├── analyze-video/         # Gemini video analysis
│   │       └── sensory-data/          # Google Sheets integration
│   │
│   ├── components/
│   │   ├── MapComponent.js            # Google Maps integration
│   │   ├── PanicButton.js             # SOS button component
│   │   ├── AROverlay.js               # AR navigation display
│   │   ├── SafeHavensPreview.js       # Haven discovery widget
│   │   ├── CalmScoreHeader.js         # Wellness metric display
│   │   ├── QuickActionGrid.js         # Quick access tools
│   │   ├── MusicPlayer.js             # Spotify integration
│   │   ├── VideoUpload.js             # Video analysis upload
│   │   ├── ReportTrigger.js           # Issue reporting
│   │   ├── Sidebar.js                 # Navigation menu
│   │   ├── AuthContext.js             # Authentication state
│   │   └── ThemeContext.js            # Theme management
│   │
│   ├── lib/
│   │   └── firebase.js                # Firebase configuration
│   │
│   └── styles/
│       └── globals.css                # Global styling
│
├── android/
│   ├── MainActivity.kt                # Android app entry point
│   ├── AndroidManifest.xml            # App configuration
│   └── app/src/main/res/              # Android resources
│
├── package.json                       # Dependencies
├── next.config.js                     # Next.js configuration
└── jsconfig.json                      # JavaScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16.0 or higher
- **npm** or **yarn** package manager
- **Google Cloud Account** (for Maps & Sheets APIs)
- **Firebase Account** (for authentication)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Dharaneesh20/Neuro-Nav-App.git
   cd Neuro-Nav-App
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📱 Platform-Specific Setup

### Android APK Setup
1. Download the APK from [v1.0.0 Release](https://github.com/Dharaneesh20/Neuro-Nav-App/releases/tag/v1.0.0)
2. Enable "Unknown Sources" in Android Settings
3. Install the APK file
4. Grant location and camera permissions
5. Launch the app and complete onboarding

### Widescreen/Tablet Version
Access the optimized tablet interface at:
- [neuronavwidescreen.vercel.app/dashboard](https://neuronavwidescreen.vercel.app/dashboard)
- Repository: [Neuro-Nav-Tab](https://github.com/Dharaneesh20/Neuro-Nav-Tab)

### PC Desktop Version (Recommended)
- Visit [neuro-nav-327583870558.us-central1.run.app](https://neuro-nav-327583870558.us-central1.run.app/)
- Best experienced in Chrome/Edge on full HD displays
- Optimized layout for widescreen monitors

---

## 🔐 Core Components Explained

### Authentication (AuthContext.js)
- Firebase-based user authentication
- Google OAuth integration
- Secure session management
- User profile persistence

### Map Integration (MapComponent.js)
- Google Maps API integration
- Real-time location tracking
- Safe haven markers with cluster support
- Interactive route preview

### Sensory Data (api/sensory-data/route.js)
- Google Sheets integration for real-time data
- Noise level metrics (decibels)
- Light intensity measurements
- Crowd density assessment

### AI Video Analysis (api/analyze-video/route.js)
- Google Gemini AI integration
- Video upload for local sensory analysis
- Automatic trigger detection
- Route recommendations based on analysis

### Wellness Scoring (CalmScoreHeader.js)
- Dynamic calm score (0-10 scale)
- Location-based comfort metrics
- Personalized recommendations
- Anxiety level monitoring

### Emergency Response (AROverlay.js)
- AR-powered navigation to safe havens
- Real-time guidance with visual arrows
- Emergency resource location
- Crisis hotline integration

---

## 📊 API Endpoints

### GET `/api/sensory-data`
Fetch real-time sensory data from Google Sheets
```json
{
  "data": [
    {
      "street": "5th Ave",
      "decibel": 85,
      "light": "High",
      "crowd": "Dense"
    }
  ]
}
```

### POST `/api/sensory-data`
Submit sensory data contributions
```json
{
  "street": "Park Lane",
  "decibel": 40,
  "light": "Low",
  "crowd": "Sparse"
}
```

### POST `/api/analyze-video`
Analyze video for sensory triggers
```json
{
  "success": true,
  "analysis": {
    "triggers": ["Construction", "High Decibel"],
    "recommendation": "Avoid this route",
    "coordinates": { "lat": 40.7850, "lng": -73.9682 }
  }
}
```

---

## 🎨 Customization

### Theme Configuration
The app supports light and dark themes. Modify colors in `styles/globals.css`:
```css
:root {
  --primary-teal-light: #38bdf8;
  --secondary-lavender: #a78bfa;
  --neutral-bg: #0f172a;
  --neutral-text-light: #cbd5e1;
  /* ... more variables ... */
}

[data-theme="light"] {
  --neutral-bg: #ffffff;
  /* ... light theme overrides ... */
}
```

### Sensory Profile Customization
Users can customize their sensory sensitivity settings in:
- **Settings Page** - Individual trigger management
- **Profile Setup** - Initial sensitivity profile creation
- **Real-time Adjustments** - Quick sensitivity toggles

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login flow
- [ ] Map loads with current location
- [ ] Safe havens display correctly
- [ ] Panic button triggers emergency UI
- [ ] Sensory data updates in real-time
- [ ] Theme switching works smoothly
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Spotify music player loads
- [ ] Video upload and analysis complete

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 📈 Performance Optimizations

- **Image Optimization** - Next.js Image component usage
- **Code Splitting** - Automatic route-based splitting
- **Static Generation** - Pre-rendered pages where possible
- **API Routes** - Serverless function deployment
- **Caching** - Browser and server-side caching
- **Compression** - GZIP compression for assets

---

## 🔒 Security & Privacy

- **Firebase Authentication** - Secure user verification
- **Environment Variables** - Sensitive data protection
- **HTTPS Only** - Encrypted data transmission
- **Privacy Policy** - GDPR compliant data handling
- **Minimal Data Collection** - Only necessary sensory data
- **User Consent** - Explicit permission for location/camera

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/Dharaneesh20/Neuro-Nav-App.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit Changes**
   ```bash
   git commit -m "Add some AmazingFeature"
   ```

4. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure all tests pass

---

## 📋 Roadmap

### Phase 1 (Current ✅)
- [x] Core navigation and mapping
- [x] Sensory data integration
- [x] Basic safe haven discovery
- [x] Emergency SOS functionality
- [x] User authentication

### Phase 2 (In Progress 🚀)
- [ ] Advanced AI video analysis
- [ ] Community rating system
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Wearable device integration

### Phase 3 (Planned 📅)
- [ ] Real-time crowd density API
- [ ] Environmental sound detection
- [ ] Accessibility enhancements
- [ ] Multi-language support
- [ ] Premium features

---

## 🐛 Known Issues & Limitations

### Current Limitations
- Video analysis is simulated (requires Gemini API key for full functionality)
- Sensory data currently pulled from Google Sheets (can be enhanced with real-time sensors)
- AR functionality simulated in browser (requires native app for full AR support)
- Limited to major cities initially

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Check Google Maps API key in `.env.local` |
| Firebase auth failing | Verify Firebase config and credentials |
| Video analysis errors | Ensure Gemini API is enabled and funded |
| GPS not working | Allow location permissions in browser settings |

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs](https://github.com/Dharaneesh20/Neuro-Nav-App/issues)
- **Email**: [Your contact email]
- **Live Demo**: [neuro-nav-327583870558.us-central1.run.app](https://neuro-nav-327583870558.us-central1.run.app/)

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Cloud Platform** - Hosting and services
- **Firebase** - Authentication infrastructure
- **Google Maps API** - Location and navigation
- **Google Generative AI (Gemini)** - Video analysis
- **Framer Motion** - Animation capabilities
- **Spotify** - Soothing music integration
- **Open Source Community** - Inspiration and support

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 2,000+ |
| **Components** | 12+ |
| **API Endpoints** | 3+ |
| **Supported Platforms** | 3 (Web, Mobile, Tablet) |
| **Active Users** | Growing community |
| **GitHub Stars** | ⭐ [Star us!](https://github.com/Dharaneesh20/Neuro-Nav-App) |

---

## 🎯 Mission Statement

**"We believe everyone deserves to navigate their world with confidence and comfort."**

Neuro-Nav is committed to creating a more accessible, inclusive urban experience for individuals with sensory sensitivities and invisible disabilities. Through technology and community support, we're making cities safer and calmer for everyone.

---

<div align="center">

### 🌟 Support Neuro-Nav

Give us a ⭐ on GitHub and help spread awareness about sensory-friendly navigation!

[⭐ Star on GitHub](https://github.com/Dharaneesh20/Neuro-Nav-App) • [📱 Download APK](https://github.com/Dharaneesh20/Neuro-Nav-App/releases/tag/v1.0.0) • [🌐 Live Demo](https://neuro-nav-327583870558.us-central1.run.app/)

**Made with ❤️ for a calmer world**

</div>

---

**Last Updated:** January 2026 | Version 1.0.0
