/**
 * WeatherNow - Geocoding Service
 * City search using OpenWeatherMap Geocoding API.
 * Features query-keyed request caching and deduplication.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface DirectGeocodingItem {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface SearchOptions {
  query: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private readonly apiKey = environment.weatherApiKey;
  private readonly baseUrl = environment.geoApiBaseUrl;
  private readonly http = inject(HttpClient);

  // Query-keyed in-flight request deduplication cache
  private readonly inflightRequests = new Map<string, Observable<CitySuggestion[]>>();

  /**
   * Reverse geocode coordinates to obtain a friendly city/locality name.
   */
  reverseGeocode(lat: number, lon: number): Observable<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      return of(`GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
    }

    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('limit', '1')
      .set('appid', this.apiKey);

    return this.http
      .get<DirectGeocodingItem[]>('https://api.openweathermap.org/geo/1.0/reverse', { params })
      .pipe(
        map((results) => {
          if (results && results.length > 0) {
            const item = results[0];
            return item.state ? `${item.name}, ${item.state}` : `${item.name}, ${item.country}`;
          }
          return `GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
        }),
        catchError(() => of(`GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`)),
      );
  }

  /**
   * Search cities by name.
   */
  searchCities(options: SearchOptions): Observable<CitySuggestion[]> {
    const query = options.query.trim().toLowerCase();
    if (!query || query.length < 2) {
      return of([]);
    }

    const limit = options.limit || 5;
    const cacheKey = `${query}_${limit}`;

    // Return in-flight request if one is already running for the exact query
    const existing = this.inflightRequests.get(cacheKey);
    if (existing) {
      return existing;
    }

    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString())
      .set('appid', this.apiKey);

    const request$ = this.http
      .get<DirectGeocodingItem[]>(`${this.baseUrl}`, { params })
      .pipe(
        map((results) => this.mapResults(results)),
        shareReplay({ bufferSize: 1, refCount: true }),
        catchError(() => of([])),
      );

    this.inflightRequests.set(cacheKey, request$);

    // Clean up cache entry after completion
    request$.subscribe({
      next: () => this.inflightRequests.delete(cacheKey),
      error: () => this.inflightRequests.delete(cacheKey),
    });

    return request$;
  }

  /**
   * Map API response to CitySuggestion array.
   */
  private mapResults(results: DirectGeocodingItem[]): CitySuggestion[] {
    if (!Array.isArray(results)) return [];
    return results
      .filter((r) => r && r.name)
      .map((r) => ({
        name: r.name,
        country: r.country || '',
        state: r.state || undefined,
        lat: Number(r.lat),
        lon: Number(r.lon),
      }))
      .filter((c) => !isNaN(c.lat) && !isNaN(c.lon));
  }
}
