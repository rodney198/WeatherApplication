/**
 * WeatherNow - Environment configuration
 * API keys are never hardcoded in source - they are injected at build time.
 */

declare global {
  interface Window {
    __WEATHER_API_KEY__?: string;
  }
}

export const environment = {
  production: false,
  weatherApiBaseUrl: 'https://api.openweathermap.org/data/2.5',
  weatherApiKey:
    (typeof window !== 'undefined' && window.__WEATHER_API_KEY__) || 'YOUR_API_KEY_HERE',
  geoApiBaseUrl: 'https://api.openweathermap.org/geo/1.0/direct',
  weatherCacheTtl: 30 * 60 * 1000, // 30 minutes
  searchDebounceMs: 300,
  maxSavedLocations: 10,
};
