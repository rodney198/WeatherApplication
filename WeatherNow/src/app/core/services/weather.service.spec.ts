/**
 * WeatherNow - Weather Service Tests
 * Comprehensive unit tests for WeatherService API integration, caching, and fallback.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { WeatherService } from './weather.service';
import { WeatherResponse } from '../models/weather.model';

// Mock HTTP client
const mockHttp = {
  get: vi.fn(),
};

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        { provide: HttpClient, useValue: mockHttp },
      ],
    });
    service = TestBed.inject(WeatherService);
    // Ensure test baseline uses unconfigured key for fallback & caching tests
    (service as any).apiKey = 'YOUR_API_KEY_HERE';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return demo/fallback weather data when API key is unconfigured', async () => {
    const data = await new Promise<WeatherResponse>((resolve, reject) => {
      service
        .fetchWeather({ lat: 40.7128, lon: -74.006, units: 'metric' })
        .pipe(take(1))
        .subscribe({
          next: (d) => resolve(d),
          error: (e) => reject(e),
        });
    });

    expect(data).toBeTruthy();
    expect(data.current.temp).toBeDefined();
    expect(data.hourly.length).toBe(24);
    expect(data.daily.length).toBe(7);
  });

  it('should cache weather data and validate cache key', async () => {
    const lat = 40.7128;
    const lon = -74.006;
    const units: 'metric' | 'imperial' = 'metric';

    expect(service.isCacheValid(lat, lon, units)).toBe(false);

    await new Promise<WeatherResponse>((resolve, reject) => {
      service
        .fetchWeather({ lat, lon, units })
        .pipe(take(1))
        .subscribe({
          next: (d) => resolve(d),
          error: (e) => reject(e),
        });
    });

    expect(service.isCacheValid(lat, lon, units)).toBe(true);
    expect(service.getCachedWeather(lat, lon, units)).toBeTruthy();
  });

  it('should clear cache', async () => {
    const lat = 40.7128;
    const lon = -74.006;

    await new Promise<WeatherResponse>((resolve) => {
      service
        .fetchWeather({ lat, lon, units: 'metric' })
        .pipe(take(1))
        .subscribe({ next: (d) => resolve(d) });
    });

    expect(service.isCacheValid(lat, lon, 'metric')).toBe(true);
    service.clearCache();
    expect(service.isCacheValid(lat, lon, 'metric')).toBe(false);
  });

  it('should format HTTP errors with user-friendly messages', async () => {
    // Override API key to trigger HTTP call
    (service as any).apiKey = 'test-valid-key';

    mockHttp.get.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );

    await expect(
      new Promise((_, reject) => {
        service
          .fetchWeather({ lat: 51.5074, lon: -0.1278, forceRefresh: true })
          .pipe(take(1))
          .subscribe({
            next: () => reject(new Error('Should have failed')),
            error: (err) => reject(err),
          });
      }),
    ).rejects.toThrow(/OpenWeatherMap returned 401/);
  });

  it('should handle rate limits (429) gracefully', async () => {
    (service as any).apiKey = 'test-valid-key';

    mockHttp.get.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' })),
    );

    await expect(
      new Promise((_, reject) => {
        service
          .fetchWeather({ lat: 51.5074, lon: -0.1278, forceRefresh: true })
          .pipe(take(1))
          .subscribe({
            next: () => reject(new Error('Should have failed')),
            error: (err) => reject(err),
          });
      }),
    ).rejects.toThrow(/rate limit exceeded/);
  });
});
