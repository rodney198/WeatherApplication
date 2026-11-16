# WeatherNow – Cross-Platform Weather Application

A modern, production-quality, cross-platform mobile weather application built with **Ionic Framework**, **Angular**, **TypeScript**, and **Capacitor**. Designed and architected with senior-level mobile engineering standards, clean architecture principles, and reactive state management.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Development Commands](#development-commands)
- [Weather API Configuration](#weather-api-configuration)
- [Native Platform Integration](#native-platform-integration)
  - [iOS Setup](#ios-setup)
  - [Android Setup](#android-setup)
  - [Capacitor Plugins](#capacitor-plugins)
- [State Management & Data Flow](#state-management--data-flow)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Git Branching & Commit Strategy](#git-branching--commit-strategy)
- [License](#license)

---

## Project Overview

**WeatherNow** delivers real-time weather intelligence, 24-hour hourly forecasts, and 7-day weekly outlooks in a responsive, mobile-first design. Engineered for high performance on both iOS and Android devices, it leverages native device capabilities such as GPS Geolocation, persistent storage, status bar customization, and splash screen management while gracefully supporting offline scenarios and API rate limits.

---

## Key Features

1. **Weather Dashboard**:
   - Location display (GPS-detected city or searched location).
   - Current temperature with dynamic unit formatting (°C / °F).
   - Weather condition description with iconography.
   - Meteorological metrics: Feels-like temperature, Daily High & Low, Humidity percentage, Wind speed & directional heading, Atmospheric pressure (hPa), Visibility (km/m), and Sunrise/Sunset times.
2. **Device Geolocation**:
   - Native Capacitor Geolocation integration.
   - Graceful runtime permission handling and prompt recovery.
   - Coordinate caching to minimize battery and GPS drain.
   - Fallback to manual city search upon denial or hardware timeout.
3. **City Search & Autocomplete**:
   - Debounced search queries with OpenWeatherMap Geocoding API.
   - Request deduplication to eliminate duplicate in-flight network queries.
   - Country and state/region attribution for accurate location selection.
4. **Hourly Forecast (24 Hours)**:
   - Horizontally scrollable timeline card with responsive layouts.
   - Timestamps, condition icons, temperatures, and precipitation probabilities.
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

---

## Technology Stack

- **Framework**: [Ionic Framework](https://ionicframework.com/) (v9)
- **Application Framework**: [Angular](https://angular.dev/) (Standalone Components, Signals, Zoneless Change Detection)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Cross-Platform Runtime**: [Capacitor](https://capacitorjs.com/) (v8)
- **Styling**: SCSS, Ionic Design System, CSS Custom Properties (iOS & Material Design adaptors)
- **Reactive Programming**: [RxJS](https://rxjs.dev/) (BehaviorSubject State Services)
- **API Provider**: [OpenWeatherMap REST API](https://openweathermap.org/) (Current Weather, Forecasts, Direct Geocoding)
- **Unit Testing**: [Vitest](https://vitest.dev/) with `@angular/build` test runner
- **Code Quality**: Angular ESLint & TypeScript ESLint

---

## Architecture & Directory Structure

WeatherNow strictly adheres to clean architectural separation of concerns:

```text
WeatherApplication/
├── WeatherNow/                       # Ionic Angular application root
│   ├── android/                      # Native Android project (Capacitor)
│   ├── ios/                          # Native iOS project (Capacitor)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                 # Core singleton services, state, and models
│   │   │   │   ├── interceptors/     # HTTP interceptors (auth, error handling)
│   │   │   │   ├── models/           # Strongly typed data models & interfaces
│   │   │   │   ├── services/         # API, location, native, and storage services
│   │   │   │   │   └── state/        # Reactive BehaviorSubject state managers
│   │   │   │   └── utils/            # Weather icon mapping & helper functions
│   │   │   ├── features/             # Feature modules (standalone components)
│   │   │   │   ├── home/             # Main weather dashboard & forecasts
│   │   │   │   ├── search/           # City search & autocomplete suggestions
│   │   │   │   ├── saved-locations/  # Bookmarked locations manager
│   │   │   │   └── settings/         # Unit preferences & app configurations
│   │   │   ├── shared/               # Shared reusable components, pipes & directives
│   │   │   │   ├── components/       # Weather icons, skeletons, error & empty states
│   │   │   │   └── pipes/            # Temperature, wind, datetime, pressure formatters
│   │   │   ├── app.component.ts      # Root shell component
│   │   │   ├── app.config.ts         # Application providers & dependency injection
│   │   │   └── app.routes.ts         # Lazy-loaded feature routing configuration
│   │   ├── assets/                   # Static assets, icons, and vector graphics
│   │   ├── environments/             # Environment configurations (dev/prod)
│   │   ├── theme/                    # Global Ionic styling & custom variables
│   │   ├── global.scss               # Global stylesheet
│   │   ├── index.html                # Entry HTML shell
│   │   └── main.ts                   # Angular bootstrap entry point
│   ├── angular.json                  # Angular CLI build workspace configuration
│   ├── capacitor.config.ts           # Capacitor native plugin configuration
│   ├── package.json                  # NPM dependencies and build scripts
│   └── tsconfig.json                 # TypeScript compiler configuration
└── README.md                         # Project documentation
```

---

## Prerequisites

Ensure the following development tooling is installed:

- **Node.js**: `v18.x` or higher (LTS recommended)
- **Package Manager**: `npm` (v9+)
- **Angular & Ionic CLIs** (optional, local npx binaries supported):
  ```bash
  npm install -g @ionic/cli @angular/cli
  ```
- **For iOS Development**: macOS with **Xcode 15+** and **CocoaPods** (`sudo gem install cocoapods`)
- **For Android Development**: **Android Studio Jellyfish / Koala** with Android SDK Tools and API Level 33+

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rodney198/WeatherApplication.git
   cd WeatherApplication
   ```

2. **Navigate to the application folder and install dependencies:**
   ```bash
   cd WeatherNow
   npm install
   ```

3. **Initialize native platforms (if not already synced):**
   ```bash
   npx cap sync
   ```

---

## Development Commands

Run the following commands inside the `WeatherNow` directory:

| Action | Command | Description |
|---|---|---|
| **Start Dev Server** | `npm start` or `npx ionic serve` | Launches local dev server at `http://localhost:8100` |
| **Build Production** | `npm run build` | Builds optimized production artifacts to `www/` |
| **Build Development** | `npm run watch` | Builds and watches for changes with source maps |
| **Run Unit Tests** | `npm test -- --watch=false` | Executes Vitest test suites once |
| **Run Tests (Watch)** | `npm test` | Runs Vitest in watch mode |
| **Run Linting** | `npm run lint` | Runs ESLint across TypeScript and template files |
| **Sync Capacitor** | `npx cap sync` | Copies web build assets and updates native plugins |

---

## Weather API Configuration

WeatherNow integrates with the **OpenWeatherMap REST API**.

1. Register for an API key at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).
2. Configure your API key in `WeatherNow/src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     weatherApiBaseUrl: 'https://api.openweathermap.org/data/2.5',
     geoApiBaseUrl: 'https://api.openweathermap.org/geo/1.0/direct',
     weatherApiKey: 'YOUR_OPENWEATHERMAP_API_KEY',
     weatherCacheTtl: 30 * 60 * 1000, // 30 minutes
     searchDebounceMs: 300,
     maxSavedLocations: 10,
   };
   ```
3. In production, configure environment injection or pipeline secrets to prevent committing secrets to version control.

---

## Native Platform Integration

### Capacitor Plugins

The application utilizes official Capacitor plugins:
- `@capacitor/geolocation`: Coordinates and native location permission workflows.
- `@capacitor/preferences`: Key-value storage for settings and saved cities.
- `@capacitor/status-bar`: Native status bar appearance customization.
- `@capacitor/app`: Lifecycle events (foreground/background changes).

### iOS Setup

1. Synchronize the web assets with iOS:
   ```bash
   npx cap sync ios
   ```
2. Open the Xcode workspace:
   ```bash
   npx cap open ios
   ```
3. Permissions in `ios/App/App/Info.plist`:
   - `NSLocationWhenInUseUsageDescription`: WeatherNow uses your location to show current weather conditions.
   - `NSLocationAlwaysAndWhenInUseUsageDescription`: WeatherNow uses your location to show current weather conditions.
4. Select a Simulator or connected physical iOS device, and click **Run**.

### Android Setup

1. Synchronize the web assets with Android:
   ```bash
   npx cap sync android
   ```
2. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```
3. Permissions configured in `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   ```
4. Build the project and deploy to an Android Emulator or connected physical device.

---

## State Management & Data Flow

WeatherNow utilizes dedicated RxJS BehaviorSubject services to provide a single, immutable source of truth:

```text
[Capacitor / User]
       │
       ▼
[LocationService] ──> [LocationStateService]
       │                       │
       ▼                       ▼
[WeatherService]  ──> [WeatherStateService] ──> [UI Feature Components]
       ▲                       ▲
       │                       │
[AppStorageService] ──> [SettingsStateService]
```

- **Single Source of Truth**: State services (`WeatherStateService`, `LocationStateService`, `SettingsStateService`) encapsulate application state.
- **Deduplication & Caching**: `WeatherService` transparently caches successful responses and deduplicates simultaneous requests for the same geographic bounding box.
- **Memory Safety**: Angular's `takeUntilDestroyed` and reactive signal bindings are utilized to prevent memory leaks and unmanaged subscriptions.

---

## Testing & Quality Assurance

Unit testing is configured using Vitest and `@angular/build`. Test coverage spans:
- Core API communication (`WeatherService`)
- Geocoding and search suggestions (`GeocodingService`)
- Native location management (`LocationService`)
- Reactive state managers (`WeatherStateService`, `LocationStateService`, `SettingsStateService`)
- Shared formatting pipes (`TemperaturePipe`, `WindSpeedPipe`, `WindDirectionPipe`, `DateTimePipe`)

Run the test suite:
```bash
npm test -- --watch=false
```

---

## License

This project is licensed under the MIT License.

