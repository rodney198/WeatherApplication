import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weatherapp.now',
  appName: 'WeatherNow',
  webDir: 'www',
  // Allow mixed content for development
  allowMixedContent: true,
  // iOS-specific settings
  ios: {
    // Allow inline web content
    contentInset: 'scroll',
  },
  // Android-specific settings
  android: {
    // Allow clear text for development
    allowCleartext: false,
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
  },
};

export default config;