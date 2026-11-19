import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weatherapp.now',
  appName: 'WeatherNow',
  webDir: 'www',
  // iOS-specific settings
  ios: {
    // Allow inline web content
    contentInset: 'automatic',
  },
  // Android-specific settings
  android: {
    allowMixedContent: true,
  },
  // Plugin configurations
  plugins: {
    Geolocation: {
      // iOS location usage description
      preciseLocation: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
    Preferences: {
      // Use shared preferences for Android
      sharedPreferencesName: 'WeatherNowPreferences',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#667eea',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;