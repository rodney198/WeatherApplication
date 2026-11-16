/**
 * WeatherNow - Environment configuration
 * API keys are never hardcoded in source - they are injected at build time.
 */

export const environment = {
  production: false,
  // OpenWeatherMap One Call API 2.5
  weatherApiBaseUrl: 'https://api.openweathermap.org/data/2.5',
  // API key injected via environment variable or build config
  weatherApiKey: (window as any).__WEATHER_API_KEY__ || 'YOUR_API_KEY_HERE',
  // Geocoding API for city search
  geoApiBaseUrl: 'https://api.openweathermap.org/geo/1.0/direct',
  // Cache duration in milliseconds (30 minutes)
  weatherCacheTtl: 30 * 60 * 1000,
  // Debounce delay for search input (ms)
  searchDebounceMs: 300,
  // Max saved locations
  maxSavedLocations: 10,
};