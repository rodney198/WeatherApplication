/**
 * WeatherNow - Weather Service Tests
 * Unit tests for the WeatherService API integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

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
    service = new WeatherService(mockHttp as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch weather data for given coordinates', async () => {
    const mockResponse: WeatherResponse = {
      lat: 40.7128,
      lon: -74.006,
      timezone: 'America/New_York',
      timezone_offset: -1800,
      current: {
        dt: 1699000000,
        sunrise: 1698980000,
        sunset: 1700000000,
        temp: 15.5,
        feels_like: 14.0,
        pressure: 1013,
        humidity: 65,
        dew_point: 8.5,
        uvi: 3,
        visibility: 10000,
        wind_speed: 5.0,
        wind_deg: 180,
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      },
      hourly: [],
      daily: [],
    };

    mockHttp.get.mockReturnValueOnce(of(mockResponse));

    const data = await new Promise<WeatherResponse>((resolve, reject) => {
      service.fetchWeather({ lat: 40.7128, lon: -74.006, units: 'metric' })
        .pipe(take(1))
        .subscribe({
          next: (d) => resolve(d),
          error: (e) => reject(e),
        });
    });

    expect(data).toEqual(mockResponse);
  });

  it('should cache weather data', () => {
    const lat = 40.7128;
    const lon = -74.006;
    const units: 'metric' | 'imperial' = 'metric';
    
    // Initially no cache
    expect(service.isCacheValid(lat, lon, units)).toBe(false);
  });

  it('should clear cache', () => {
    service.clearCache();
    expect((service as any).cache.size).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    mockHttp.get.mockReturnValueOnce(throwError(() => new Error('API Error')));

    await expect(
      new Promise((_, reject) => {
        service.fetchWeather({ lat: 40.7128, lon: -74.006, units: 'metric' })
          .pipe(take(1))
          .subscribe({
            next: () => reject(new Error('Should not succeed')),
            error: (e) => reject(e),
          });
      }),
    ).rejects.toThrow('API Error');
  });
});