# WeatherNow – Cross-Platform Weather Application

A modern, production-quality cross-platform weather application built with **Ionic Framework (v9)**, **Angular**, **TypeScript**, and **Capacitor (v8)**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Development Commands](#development-commands)
- [Weather API Configuration](#weather-api-configuration)
- [Native Platform Integration](#native-platform-integration)
  - [iOS Setup](#ios-setup)
  - [Android Setup](#android-setup)
  - [Capacitor Plugins](#capacitor-plugins)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Git Branching Strategy](#git-branching-strategy)
- [License](#license)

---

## Project Overview

**WeatherNow** is an engineered mobile weather application delivering real-time conditions, 24-hour hourly forecasts, and 7-day weekly outlooks in an accessible, mobile-first design. Designed for high performance on both iOS and Android devices, it leverages native device capabilities including GPS Geolocation, persistent storage, status bar customization, and splash screen management while gracefully supporting offline scenarios and API rate limits.

---

## Key Features

1. **Weather Dashboard**:
   - Location display (GPS-detected city or searched location).
   - Current temperature with dynamic unit formatting (°C / °F).
   - Weather condition description with iconography.
   - Meteorological metrics: Feels-like temperature, Daily High & Low, Humidity percentage, Wind speed & directional heading, Atmospheric pressure (hPa), Visibility (km/m), and Sunrise/Sunset times.
2. **Device Geolocation**:
   - Native Capacitor Geolocation integration with runtime permission handling.
   - Coordinate caching and reverse geocoding to resolve friendly locality names.
   - Automatic fallback to configured default city upon denial or hardware timeout.
3. **City Search & Autocomplete**:
   - Debounced search queries with OpenWeatherMap Geocoding API.
   - Query-keyed in-flight request deduplication.
   - Quick "Save to Favorites" action directly from search results.
4. **Hourly Forecast (24 Hours)**:
   - Horizontally scrollable timeline card with responsive glassmorphism design.
   - Timestamps, condition icons, temperatures, and mathematically accurate precipitation probabilities.
5. **Weekly Forecast (7 Days)**:
   - 7-day daily breakdown with High/Low temperatures, condition icons, and precipitation indicators.
6. **Saved Locations & Persistence**:
   - Favorite/bookmark cities for instant access.
   - Lightweight local persistence powered by Capacitor Preferences.
   - Seamless switching between locations and instant weather refresh.
7. **Unit Customization & Settings**:
   - Instant toggle between Metric (Celsius, m/s) and Imperial (Fahrenheit, mph) units.
   - Persistent settings across application restarts.
   - Cache clearing and data reset capabilities.
8. **Resilience, Offline & Error States**:
   - Pull-to-refresh data synchronizer.
   - Network failure interception with descriptive user messages.
   - Local in-memory caching with Time-To-Live (TTL) expiration.
   - Graceful fallback demo dataset when unconfigured or disconnected.

---

## Technology Stack

- **Ionic Framework** (v9) - Mobile UI components and design system
- **Angular** - Standalone components, reactive signals, zoneless change detection
- **TypeScript** - Strict type safety and clear models
- **Capacitor** (v8) - Native iOS & Android runtime
- **RxJS** - Reactive state management via BehaviorSubjects
- **Vitest** - Unit test runner with `@angular/build`
- **OpenWeatherMap REST API** - Weather data & geocoding provider

---

## Architecture

The application follows a clean, modular Angular architecture:

```text
src/app/
├── core/
│   ├── interceptors/     # HTTP interceptors (auth, error mapping)
│   ├── models/           # Strongly typed interfaces (weather, location, settings)
│   ├── services/         # API and device services (weather, location, native, storage)
│   │   └── state/        # Reactive state services (weather, location, settings)
│   └── utils/            # Icon mapping utilities
├── features/
│   ├── home/             # Main weather dashboard & forecasts
│   ├── search/           # City search & suggestions
│   ├── saved-locations/  # Saved/favorite cities manager
│   └── settings/         # Unit preferences & app info
├── shared/
│   ├── components/       # Weather icons, error states, empty states
│   └── pipes/            # Temperature, wind, datetime, pressure formatters
├── app.component.ts      # Root application shell
├── app.config.ts         # Application providers & dependency injection
└── app.routes.ts         # Feature-based lazy-loaded routes
```

---

## Prerequisites

- **Node.js** (`v18+` LTS)
- **npm** (`v9+`)
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds, macOS only)

---

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/rodney198/WeatherApplication.git
cd WeatherApplication/WeatherNow

# Install dependencies
npm install

# Synchronize Capacitor native platforms
npx cap sync
```

---

## Development Commands

```bash
# Start local development server
npm start

# Run unit tests once
npm test -- --watch=false

# Run unit tests in watch mode
npm test

# Run ESLint linter
npm run lint

# Build production bundle
npm run build

# Build development bundle with source maps
npm run watch
```

---

## Weather API Configuration

1. Obtain a free API key at [OpenWeatherMap](https://openweathermap.org/api).
2. Set your API key in `src/environments/environment.ts` and `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: false,
     weatherApiBaseUrl: 'https://api.openweathermap.org/data/2.5',
     geoApiBaseUrl: 'https://api.openweathermap.org/geo/1.0/direct',
     weatherApiKey: 'YOUR_API_KEY_HERE',
     weatherCacheTtl: 30 * 60 * 1000,
     searchDebounceMs: 300,
     maxSavedLocations: 10,
   };
   ```

---

## Native Platform Integration

### Capacitor Plugins Installed:
- `@capacitor/geolocation`
- `@capacitor/preferences`
- `@capacitor/status-bar`
- `@capacitor/splash-screen`
- `@capacitor/app`
- `@capacitor/haptics`
- `@capacitor/keyboard`

### iOS Setup:
```bash
npx cap sync ios
npx cap open ios
```
Location usage descriptions are configured in `ios/App/App/Info.plist`.

### Android Setup:
```bash
npx cap sync android
npx cap open android
```
Permissions (`INTERNET`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`) are configured in `android/app/src/main/AndroidManifest.xml`.

---

## Testing & Quality Assurance

WeatherNow features 55 comprehensive unit tests covering:
- `WeatherService` (API calls, data mapping, caching, error handling, rate limits, fallback)
- `LocationService` (coordinates, permissions, error mapping)
- `GeocodingService` (city search, suggestions, reverse geocoding)
- `LocationStateService` & `SettingsStateService` (state transitions and persistence)
- `NativeService` (status bar, splash screen, app lifecycle)
- Formatting Pipes (`TemperaturePipe`, `WindDirectionPipe`, `WindSpeedPipe`, `DateTimePipe`, `PressurePipe`, `VisibilityPipe`)
- UI Components (`WeatherIconComponent`, `ErrorStateComponent`, `EmptyStateComponent`)

Run tests:
```bash
npm test -- --watch=false
```

---

## Git Branching Strategy

- `main`: Stable baseline containing documentation and release-ready builds.
- `development`: Active branch where all feature development, validation, and testing takes place.

---

## License

This project is licensed under the MIT License.
