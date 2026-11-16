/**
 * WeatherNow - Weather Service
 * Centralized API communication with OpenWeatherMap.
 * Handles current, hourly, and daily forecast data in a single request.
 * Implements caching and error handling.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { shareReplay, catchError, map } from 'rxjs/operators';

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

export interface WeatherFetchResult {
  data: WeatherResponse | null;
  fromCache: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly cache = new Map<string, { data: WeatherResponse; timestamp: number }>();
  private readonly cacheTtl = environment.weatherCacheTtl;
  private readonly apiKey = environment.weatherApiKey;
  private readonly baseUrl = environment.weatherApiBaseUrl;

  // In-flight request deduplication
  private inflightRequests = new Map<string, Observable<WeatherResponse>>();

  private readonly http = inject(HttpClient);

  /**
   * Fetch weather data for given coordinates.
   * Uses the One Call API 2.5 to get current, hourly (48h), and daily (7d) data.
   * Deduplicates in-flight requests and caches responses.
   */
  fetchWeather(options: FetchWeatherOptions): Observable<WeatherResponse> {
    const cacheKey = this.getCacheKey(options);

    // Check cache first (unless forced refresh)
    if (!options.forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
        return of(cached.data);
      }
    }

    // Deduplicate in-flight requests
    const existing = this.inflightRequests.get(cacheKey);
    if (existing) {
      return existing;
    }

    const params = new HttpParams()
      .set('lat', options.lat.toString())
      .set('lon', options.lon.toString())
      .set('units', options.units || 'metric')
      .set('appid', this.apiKey)
      .set('exclude', options.exclude || 'minutely,alerts');

    const request$ = this.http
      .get<WeatherResponse>(`${this.baseUrl}/onecall/2.5`, { params })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
        tap((data) => {
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          this.inflightRequests.delete(cacheKey);
        }),
        catchError((error) => {
          this.inflightRequests.delete(cacheKey);
          throw error;
        }),
      );

    this.inflightRequests.set(cacheKey, request$);
    return request$;
  }

  /**
   * Get current weather only (lightweight request).
   */
  getCurrentWeather(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric'): Observable<CurrentWeather> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', units)
      .set('appid', this.apiKey);

    return this.http.get<{ current: CurrentWeather }>(`${this.baseUrl}/data/2.5/weather`, { params }).pipe(
      map((response) => response.current),
    );
  }

  /**
   * Get cached weather data if available (synchronous).
   */
  getCachedWeather(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric'): WeatherResponse | null {
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

  private getCacheKey(options: FetchWeatherOptions): string {
    const units = options.units || 'metric';
    return `weather_${options.lat.toFixed(4)}_${options.lon.toFixed(4)}_${units}`;
  }
}