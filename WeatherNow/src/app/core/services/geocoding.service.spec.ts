/**
 * WeatherNow - Geocoding Service Tests
 * Unit tests for city search, suggestions, and reverse geocoding.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { GeocodingService, DirectGeocodingItem } from './geocoding.service';

const mockHttp = {
  get: vi.fn(),
};

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GeocodingService,
        { provide: HttpClient, useValue: mockHttp },
      ],
    });
    service = TestBed.inject(GeocodingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array when query is shorter than 2 characters', async () => {
    const results = await new Promise((resolve) => {
      service
        .searchCities({ query: 'a' })
        .pipe(take(1))
        .subscribe((res) => resolve(res));
    });
    expect(results).toEqual([]);
    expect(mockHttp.get).not.toHaveBeenCalled();
  });

  it('should search cities and map response items properly', async () => {
    const mockApiData: DirectGeocodingItem[] = [
      {
        name: 'London',
        lat: 51.5074,
        lon: -0.1278,
        country: 'GB',
        state: 'England',
      },
    ];

    mockHttp.get.mockReturnValueOnce(of(mockApiData));

    const results = await new Promise<any[]>((resolve) => {
      service
        .searchCities({ query: 'London' })
        .pipe(take(1))
        .subscribe((res) => resolve(res));
    });

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('London');
    expect(results[0].lat).toBe(51.5074);
    expect(results[0].lon).toBe(-0.1278);
    expect(results[0].country).toBe('GB');
  });

  it('should reverse geocode coordinates to locality name', async () => {
    const mockReverseData: DirectGeocodingItem[] = [
      {
        name: 'Tokyo',
        lat: 35.6762,
        lon: 139.6503,
        country: 'JP',
      },
    ];

    // Set an API key so reverse geocode executes HTTP request
    (service as any).apiKey = 'test-key';
    mockHttp.get.mockReturnValueOnce(of(mockReverseData));

    const result = await new Promise<string>((resolve) => {
      service
        .reverseGeocode(35.6762, 139.6503)
        .pipe(take(1))
        .subscribe((name) => resolve(name));
    });

    expect(result).toBe('Tokyo, JP');
  });
});

