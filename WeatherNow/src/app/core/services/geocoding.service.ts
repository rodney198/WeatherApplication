/**
 * WeatherNow - Geocoding Service
 * City search using OpenWeatherMap Geocoding API with robust offline/catalog fallback.
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

/**
 * Built-in directory of major global cities for instant search & offline fallback
 */
export const POPULAR_CITIES: CitySuggestion[] = [
  { name: 'New York', country: 'US', state: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'GB', state: 'England', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'FR', state: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', country: 'JP', state: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Madrid', country: 'ES', state: 'Community of Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Berlin', country: 'DE', state: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Rome', country: 'IT', state: 'Lazio', lat: 41.9028, lon: 12.4964 },
  { name: 'Sydney', country: 'AU', state: 'New South Wales', lat: -33.8688, lon: 151.2093 },
  { name: 'Toronto', country: 'CA', state: 'Ontario', lat: 43.6532, lon: -79.3832 },
  { name: 'Dubai', country: 'AE', state: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'SG', state: '', lat: 1.3521, lon: 103.8198 },
  { name: 'Mumbai', country: 'IN', state: 'Maharashtra', lat: 19.076, lon: 72.8777 },
  { name: 'Delhi', country: 'IN', state: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Los Angeles', country: 'US', state: 'California', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.8781, lon: -87.6298 },
  { name: 'San Francisco', country: 'US', state: 'California', lat: 37.7749, lon: -122.4194 },
  { name: 'Miami', country: 'US', state: 'Florida', lat: 25.7617, lon: -80.1918 },
  { name: 'Barcelona', country: 'ES', state: 'Catalonia', lat: 41.3879, lon: 2.1699 },
  { name: 'Amsterdam', country: 'NL', state: 'North Holland', lat: 52.3676, lon: 4.9041 },
  { name: 'Seoul', country: 'KR', state: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Bangkok', country: 'TH', state: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Cairo', country: 'EG', state: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'São Paulo', country: 'BR', state: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Mexico City', country: 'MX', state: 'Federal District', lat: 19.4326, lon: -99.1332 },
  { name: 'Kullu', country: 'IN', state: 'Himachal Pradesh', lat: 31.9579, lon: 77.1095 },
  { name: 'Zurich', country: 'CH', state: 'Zurich', lat: 47.3769, lon: 8.5417 },
  { name: 'Vienna', country: 'AT', state: 'Vienna', lat: 48.2082, lon: 16.3738 },
];

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
    const fallbackName = (): string => {
      const closest = POPULAR_CITIES.find(
        (c) => Math.abs(c.lat - lat) < 0.1 && Math.abs(c.lon - lon) < 0.1,
      );
      if (closest) {
        return closest.state && closest.state !== closest.name
          ? `${closest.name}, ${closest.state}`
          : `${closest.name}, ${closest.country}`;
      }
      return `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
    };

    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      return of(fallbackName());
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
          return fallbackName();
        }),
        catchError(() => of(fallbackName())),
      );
  }

  /**
   * Search cities by name with resilient local directory fallback.
   */
  searchCities(options: SearchOptions): Observable<CitySuggestion[]> {
    const query = options.query.trim().toLowerCase();
    if (!query || query.length < 2) {
      return of([]);
    }

    const limit = options.limit || 7;
    const localMatches = POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.state && c.state.toLowerCase().includes(query)) ||
        c.country.toLowerCase().includes(query),
    ).slice(0, limit);

    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      return of(localMatches);
    }

    const cacheKey = `${query}_${limit}`;
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
        map((results) => {
          const mapped = this.mapResults(results);
          if (mapped.length > 0) {
            return mapped;
          }
          return localMatches;
        }),
        catchError(() => of(localMatches)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

    this.inflightRequests.set(cacheKey, request$);

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
