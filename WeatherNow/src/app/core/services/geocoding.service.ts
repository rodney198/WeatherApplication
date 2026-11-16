/**
 * WeatherNow - Geocoding Service
 * City search using OpenWeatherMap Geocoding API.
 * Handles debouncing and request deduplication.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map,catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
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
  private inflightRequest: Observable<CitySuggestion[]> | null = null;

  constructor(private readonly http: HttpClient) {}

  /**
   * Search cities by name. Returns an Observable that emits debounced results.
   * Use this with async pipe in components.
   */
  searchCities(options: SearchOptions): Observable<CitySuggestion[]> {
    const query = options.query.trim();
    if (!query || query.length < 2) {
      return of([]);
    }

    // Deduplicate in-flight requests
    if (this.inflightRequest) {
      return this.inflightRequest;
    }

    const params = new HttpParams()
      .set('q', query)
      .set('limit', (options.limit || 5).toString())
      .set('appid', this.apiKey);

    this.inflightRequest = this.http
      .get<any[]>(`${this.baseUrl}`, { params })
      .pipe(
        map((results) => this.mapResults(results)),
        tap(() => (this.inflightRequest = null)),
        catchError((error) => {
          this.inflightRequest = null;
          return of([]);
        }),
      );

    return this.inflightRequest;
  }

  /**
   * Create a debounced search observable for use with form controls.
   */
  createDebouncedSearch(): (query: string) => Observable<CitySuggestion[]> {
    return (query: string) =>
      of(query).pipe(
        debounceTime(environment.searchDebounceMs),
        distinctUntilChanged(),
        switchMap((q) => this.searchCities({ query: q })),
      );
  }

  /**
   * Map API response to CitySuggestion array.
   */
  private mapResults(results: any[]): CitySuggestion[] {
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