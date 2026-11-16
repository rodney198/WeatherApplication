/**
 * WeatherNow - Production Environment Configuration
 * API keys and production endpoints.
 */

declare global {
  interface Window {
    __WEATHER_API_KEY__?: string;
  }
}

export const environment = {
  production: true,
  weatherApiBaseUrl: 'https://api.openweathermap.org/data/2.5',
  weatherApiKey:
    (typeof window !== 'undefined' && window.__WEATHER_API_KEY__) || 'YOUR_API_KEY_HERE',
  geoApiBaseUrl: 'https://api.openweathermap.org/geo/1.0/direct',
  weatherCacheTtl: 30 * 60 * 1000, // 30 minutes
  searchDebounceMs: 300,
  maxSavedLocations: 10,
};
