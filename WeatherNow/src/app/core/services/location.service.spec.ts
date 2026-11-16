/**
 * WeatherNow - Location Service Tests
 * Unit tests for LocationService and Capacitor Geolocation wrapper.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Geolocation, Position } from '@capacitor/geolocation';

import { LocationService } from './location.service';

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn(),
  },
}));

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LocationService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should cache and retrieve device position', () => {
    const coords = { latitude: 40.7128, longitude: -74.006, accuracy: 10 };
    service.cachePosition(coords);
    expect(service.getCachedPosition()).toEqual(coords);
  });

  it('should clear cached position', () => {
    const coords = { latitude: 40.7128, longitude: -74.006, accuracy: 10 };
    service.cachePosition(coords);
    service.clearCache();
    expect(service.getCachedPosition()).toBeNull();
  });

  it('should return true when permission is granted', async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValueOnce({
      location: 'granted',
      coarseLocation: 'granted',
    });

    const hasPermission = await service.checkPermission();
    expect(hasPermission).toBe(true);
  });

  it('should return false when permission is denied', async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValueOnce({
      location: 'denied',
      coarseLocation: 'denied',
    });

    const hasPermission = await service.checkPermission();
    expect(hasPermission).toBe(false);
  });

  it('should request permission and report outcome', async () => {
    vi.mocked(Geolocation.requestPermissions).mockResolvedValueOnce({
      location: 'granted',
      coarseLocation: 'granted',
    });

    const granted = await service.requestPermission();
    expect(granted).toBe(true);
  });

  it('should retrieve current position coordinates', async () => {
    const mockPosition = {
      timestamp: Date.now(),
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
    };

    vi.mocked(Geolocation.getCurrentPosition).mockResolvedValueOnce(
      mockPosition as unknown as Position,
    );

    const result = await service.getCurrentPositionAsync();
    expect(result.coordinates.latitude).toBe(37.7749);
    expect(result.coordinates.longitude).toBe(-122.4194);
    expect(result.accuracy).toBe(5);
  });

  it('should map permission denied error correctly', () => {
    const error = (service as any).mapError(new Error('User denied Geolocation permission'));
    expect(error.code).toBe('PERMISSION_DENIED');
  });

  it('should map timeout error correctly', () => {
    const error = (service as any).mapError(new Error('Location request Timeout expired'));
    expect(error.code).toBe('TIMEOUT');
  });
});
