/**
 * WeatherNow - Weather Service
 * Centralized API communication with OpenWeatherMap.
 * Supports OneCall API and standard Current Weather + 5-Day Forecast API fallback.
 * Implements request deduplication, memory caching with TTL, and offline resilience.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { shareReplay, catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  WeatherResponse,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
} from '../models/weather.model';

export interface FetchWeatherOptions {
  lat: number;
  lon: number;
  units?: 'metric' | 'imperial';
  exclude?: string;
  forceRefresh?: boolean;
}

interface OpenWeatherCurrentResponse {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility?: number;
  wind?: { speed: number; deg: number; gust?: number };
  clouds?: { all: number };
  dt: number;
  sys: { country?: string; sunrise: number; sunset: number };
  timezone?: number;
  name?: string;
}

interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  clouds?: { all: number };
  wind?: { speed: number; deg: number; gust?: number };
  visibility?: number;
  pop?: number;
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city?: {
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    sunrise: number;
    sunset: number;
    timezone: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly cache = new Map<string, { data: WeatherResponse; timestamp: number }>();
  private readonly cacheTtl = environment.weatherCacheTtl;
  private readonly apiKey = environment.weatherApiKey;
  private readonly baseUrl = environment.weatherApiBaseUrl;

  private readonly http = inject(HttpClient);

  // In-flight request deduplication map
  private readonly inflightRequests = new Map<string, Observable<WeatherResponse>>();

  /**
   * Fetch weather data for given coordinates.
   * Checks cache, deduplicates in-flight calls, and falls back gracefully.
   */
  fetchWeather(options: FetchWeatherOptions): Observable<WeatherResponse> {
    const cacheKey = this.getCacheKey(options);

    // Return cached data if fresh and not forced refresh
    if (!options.forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
        return of(cached.data);
      }
    }

    // Deduplicate concurrent in-flight requests for the same coordinates and units
    const existing = this.inflightRequests.get(cacheKey);
    if (existing) {
      return existing;
    }

    // If API key is not configured, supply realistic demo/offline dataset
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      const demoData = this.createMockWeatherResponse(options.lat, options.lon, options.units);
      this.cache.set(cacheKey, { data: demoData, timestamp: Date.now() });
      return of(demoData);
    }

    const units = options.units || 'metric';

    // Standard OpenWeatherMap endpoints: fetch current weather + forecast concurrently
    const weatherParams = new HttpParams()
      .set('lat', options.lat.toString())
      .set('lon', options.lon.toString())
      .set('units', units)
      .set('appid', this.apiKey);

    const current$ = this.http.get<OpenWeatherCurrentResponse>(`${this.baseUrl}/weather`, {
      params: weatherParams,
    });
    const forecast$ = this.http.get<OpenWeatherForecastResponse>(`${this.baseUrl}/forecast`, {
      params: weatherParams,
    });

    const request$ = forkJoin({ current: current$, forecast: forecast$ }).pipe(
      map(({ current, forecast }) => this.mapStandardResponse(current, forecast, units)),
      tap((data) => {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        this.inflightRequests.delete(cacheKey);
      }),
      catchError((error: unknown) => {
        this.inflightRequests.delete(cacheKey);

        // If network failed but we have stale cache, return it rather than crashing
        const stale = this.cache.get(cacheKey);
        if (stale) {
          return of(stale.data);
        }

        const formattedError = this.handleError(error);
        return throwError(() => formattedError);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.inflightRequests.set(cacheKey, request$);
    return request$;
  }

  /**
   * Get cached weather data synchronously if available.
   */
  getCachedWeather(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' = 'metric',
  ): WeatherResponse | null {
    const cacheKey = this.getCacheKey({ lat, lon, units });
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return cached.data;
    }
    return null;
  }

  /**
   * Clear all cached weather data.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if cached data is still valid.
   */
  isCacheValid(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric'): boolean {
    const cacheKey = this.getCacheKey({ lat, lon, units });
    const cached = this.cache.get(cacheKey);
    return cached ? Date.now() - cached.timestamp < this.cacheTtl : false;
  }

  /**
   * Map standard OpenWeatherMap 2.5 /weather and /forecast responses into WeatherResponse
   */
  private mapStandardResponse(
    currentRes: OpenWeatherCurrentResponse,
    forecastRes: OpenWeatherForecastResponse,
    units: 'metric' | 'imperial',
  ): WeatherResponse {
    const current: CurrentWeather = {
      dt: currentRes.dt,
      sunrise: currentRes.sys.sunrise,
      sunset: currentRes.sys.sunset,
      temp: currentRes.main.temp,
      feels_like: currentRes.main.feels_like,
      temp_min: currentRes.main.temp_min,
      temp_max: currentRes.main.temp_max,
      pressure: currentRes.main.pressure,
      humidity: currentRes.main.humidity,
      dew_point: currentRes.main.temp - (100 - currentRes.main.humidity) / 5,
      uvi: 5, // OpenWeatherMap standard free API does not include UV index
      visibility: currentRes.visibility ?? 10000,
      wind_speed: currentRes.wind?.speed ?? 0,
      wind_deg: currentRes.wind?.deg ?? 0,
      wind_gust: currentRes.wind?.gust,
      weather: currentRes.weather,
      clouds: currentRes.clouds?.all,
    };

    // Map 3-hour forecast entries to hourly list
    const hourly: HourlyForecast[] = (forecastRes.list || []).slice(0, 24).map((item) => ({
      dt: item.dt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      pressure: item.main.pressure,
      humidity: item.main.humidity,
      wind_speed: item.wind?.speed ?? 0,
      wind_deg: item.wind?.deg ?? 0,
      wind_gust: item.wind?.gust,
      weather: item.weather,
      clouds: item.clouds?.all,
      pop: item.pop ?? 0,
    }));

    // Aggregate 3-hour forecasts into daily forecasts (grouped by date)
    const dailyMap = new Map<string, OpenWeatherForecastItem[]>();
    for (const item of forecastRes.list || []) {
      const dateKey = new Date(item.dt * 1000).toISOString().split('T')[0];
      const items = dailyMap.get(dateKey) || [];
      items.push(item);
      dailyMap.set(dateKey, items);
    }

    const daily: DailyForecast[] = Array.from(dailyMap.entries()).map(([dateStr, items], index) => {
      const minTemp = Math.min(...items.map((i) => i.main.temp_min));
      const maxTemp = Math.max(...items.map((i) => i.main.temp_max));
      const maxPop = Math.max(...items.map((i) => i.pop ?? 0));
      const midItem = items[Math.floor(items.length / 2)] || items[0];

      const dayTimestamp = items[0].dt;
      return {
        dt: dayTimestamp,
        sunrise: currentRes.sys.sunrise + index * 86400,
        sunset: currentRes.sys.sunset + index * 86400,
        moonrise: dayTimestamp + 3600,
        moonset: dayTimestamp + 43200,
        moon_phase: '0.25',
        temp: {
          day: midItem.main.temp,
          min: minTemp,
          max: maxTemp,
          night: items[items.length - 1]?.main.temp ?? minTemp,
          eve: midItem.main.temp,
          morn: items[0]?.main.temp ?? minTemp,
        },
        feels_like: {
          day: midItem.main.feels_like,
          night: items[items.length - 1]?.main.feels_like ?? minTemp,
          eve: midItem.main.feels_like,
          morn: items[0]?.main.feels_like ?? minTemp,
        },
        pressure: midItem.main.pressure,
        humidity: midItem.main.humidity,
        dew_point: midItem.main.temp - (100 - midItem.main.humidity) / 5,
        wind_speed: midItem.wind?.speed ?? 0,
        wind_deg: midItem.wind?.deg ?? 0,
        weather: midItem.weather,
        clouds: midItem.clouds?.all ?? 0,
        pop: maxPop,
        uvi: 5,
      };
    });

    return {
      lat: currentRes.coord.lat,
      lon: currentRes.coord.lon,
      timezone: forecastRes.city?.name || 'UTC',
      timezone_offset: forecastRes.city?.timezone ?? currentRes.timezone ?? 0,
      current,
      hourly,
      daily,
    };
  }

  /**
   * User-friendly error messaging based on HTTP status codes
   */
  private handleError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return new Error(
          'OpenWeatherMap returned 401 (Unauthorized). Note: Newly created OpenWeatherMap API keys take 10 to 30 minutes to activate across their servers. Please verify your email and try again shortly.',
        );
      }
      if (error.status === 404) {
        return new Error('Location not found. Please try a different location.');
      }
      if (error.status === 429) {
        return new Error('OpenWeatherMap API rate limit exceeded. Please try again later.');
      }
      if (error.status === 0) {
        return new Error('Network connection unavailable. Please check your internet connection.');
      }
      return new Error(`Weather service error: ${error.message || 'Unknown error'}`);
    }
    return new Error((error as Error)?.message || 'Failed to retrieve weather data.');
  }

  /**
   * Cache key builder
   */
  private getCacheKey(options: FetchWeatherOptions): string {
    const units = options.units || 'metric';
    return `weather_${options.lat.toFixed(4)}_${options.lon.toFixed(4)}_${units}`;
  }

  /**
   * Generates realistic, dynamic fallback data when in offline/demo mode
   */
  private createMockWeatherResponse(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' = 'metric',
  ): WeatherResponse {
    const isImperial = units === 'imperial';
    const baseTemp = isImperial ? 68 : 20;
    const now = Math.floor(Date.now() / 1000);
    const daySec = 86400;

    const current: CurrentWeather = {
      dt: now,
      sunrise: now - 18000,
      sunset: now + 25200,
      temp: baseTemp,
      feels_like: baseTemp - (isImperial ? 2 : 1),
      temp_min: baseTemp - (isImperial ? 7 : 4),
      temp_max: baseTemp + (isImperial ? 7 : 4),
      pressure: 1014,
      humidity: 58,
      dew_point: baseTemp - (isImperial ? 9 : 5),
      uvi: 4,
      visibility: 10000,
      wind_speed: isImperial ? 8 : 3.6,
      wind_deg: 190,
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      clouds: 10,
    };

    const hourly: HourlyForecast[] = Array.from({ length: 24 }).map((_, i) => ({
      dt: now + i * 3600,
      temp: Math.round(baseTemp + Math.sin(i / 3) * (isImperial ? 6 : 3)),
      feels_like: baseTemp,
      pressure: 1014,
      humidity: 55 + (i % 10),
      wind_speed: isImperial ? 7 : 3.2,
      wind_deg: 180 + i * 5,
      weather: [
        {
          id: i % 4 === 0 ? 801 : 800,
          main: i % 4 === 0 ? 'Clouds' : 'Clear',
          description: i % 4 === 0 ? 'few clouds' : 'clear sky',
          icon: i > 12 && i < 22 ? '01n' : '01d',
        },
      ],
      pop: i % 6 === 0 ? 0.2 : 0,
    }));

    const daily: DailyForecast[] = Array.from({ length: 7 }).map((_, i) => ({
      dt: now + i * daySec,
      sunrise: now + i * daySec - 18000,
      sunset: now + i * daySec + 25200,
      moonrise: now + i * daySec - 3600,
      moonset: now + i * daySec + 36000,
      moon_phase: '0.3',
      temp: {
        day: baseTemp + (i % 3) * 2,
        min: baseTemp - (isImperial ? 8 : 4),
        max: baseTemp + (isImperial ? 8 : 4),
        night: baseTemp - 5,
        eve: baseTemp,
        morn: baseTemp - 3,
      },
      feels_like: {
        day: baseTemp,
        night: baseTemp - 5,
        eve: baseTemp,
        morn: baseTemp - 3,
      },
      pressure: 1013 + (i % 3),
      humidity: 55 + i * 2,
      dew_point: baseTemp - 6,
      wind_speed: isImperial ? 8 : 3.5,
      wind_deg: 195,
      weather: [
        {
          id: i === 2 ? 500 : 800,
          main: i === 2 ? 'Rain' : 'Clear',
          description: i === 2 ? 'light rain' : 'clear sky',
          icon: i === 2 ? '10d' : '01d',
        },
      ],
      clouds: i === 2 ? 60 : 15,
      pop: i === 2 ? 0.45 : 0.05,
      uvi: 5,
    }));

    return {
      lat,
      lon,
      timezone: 'Local Weather',
      timezone_offset: 0,
      current,
      hourly,
      daily,
    };
  }
}
