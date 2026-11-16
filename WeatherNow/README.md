# WeatherNow

A modern, production-quality cross-platform weather application built with Ionic, Angular, TypeScript, and Capacitor.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Commands](#development-commands)
- [Weather API Configuration](#weather-api-configuration)
- [iOS Setup](#ios-setup)
- [Android Setup](#android-setup)
- [Testing](#testing)
- [Git Branching and Commit Strategy](#git-branching-and-commit-strategy)

## Project Overview

WeatherNow is a fully functional weather application that demonstrates modern hybrid mobile development practices. It features current weather conditions, hourly and weekly forecasts, city search, saved locations, and native platform integration.

## Technology Stack

- **Ionic Framework** (v9) - Mobile UI components and design system
- **Angular** (v22) - Application framework and dependency injection
- **TypeScript** (v6) - Type-safe development
- **Capacitor** (v8) - Native platform integration
- **RxJS** - Reactive state management
- **Vitest** - Unit testing
- **OpenWeatherMap API** - Weather data source

## Architecture

The application follows a modular Angular architecture:

```
src/app/
├── core/           # Services, models, interceptors, state management
├── shared/         # Reusable UI components, pipes, directives
├── features/       # Home, Search, Saved Locations, Settings
├── app.config.ts   # Application providers
└── app.routes.ts   # Routing configuration
```

### State Management

Reactive state is managed using RxJS BehaviorSubject services:
- `WeatherStateService` - Weather data state
- `LocationStateService` - Location and saved locations state
- `SettingsStateService` - User preferences state

## Features

- Current weather with temperature, conditions, and detailed metrics
- Hourly forecast (24 hours)
- Weekly forecast (7 days)
- Device geolocation with permission handling
- City search with debounced suggestions
- Saved locations with local persistence
- Celsius/Fahrenheit temperature selection
- Pull-to-refresh functionality
- Loading, error, and empty states
- Native Capacitor integration (iOS/Android)

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)

## Installation

```bash
# Clone the repository
git clone https://github.com/rodney198/WeatherApplication.git
cd WeatherApplication

# Switch to development branch
git checkout development

# Install dependencies
cd WeatherNow
npm install

# Set up Capacitor platforms
npx cap add ios
npx cap add android
```

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Build for development
npm run build -- --configuration development

# Run tests
npm test

# Lint code
npm run lint
```

## Weather API Configuration

The application uses the OpenWeatherMap One Call API 2.5. To configure:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api) and get your API key
2. Set the API key in the environment configuration:
   ```typescript
   // src/environments/environment.ts
   weatherApiKey: 'YOUR_API_KEY_HERE'
   ```
3. For production builds, inject the key at build time

## iOS Setup

1. Open the project in Xcode:
   ```bash
   cd WeatherNow
   npx cap open ios
   ```

2. Ensure location permissions are configured in `ios/App/App/Info.plist`

3. Build and run on a physical device or simulator

## Android Setup

1. Set up Android Studio with the required SDKs
2. Open the project:
   ```bash
   cd WeatherNow
   npx cap open android
   ```

3. Build and run on a physical device or emulator

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Git Branching and Commit Strategy

- Development happens on the `development` branch
- Features are committed individually with meaningful messages
- Never commit to `main` or `master`
- Follow semantic commit message conventions

## License

This project is for demonstration purposes.