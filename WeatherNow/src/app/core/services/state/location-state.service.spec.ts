/**
 * WeatherNow - Location State Service Tests
 * Unit tests for LocationStateService and local persistence.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { LocationStateService } from './location-state.service';
import { AppStorageService } from '../storage.service';

const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
};

describe('LocationStateService', () => {
  let service: LocationStateService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.get.mockResolvedValue([]);
    mockStorage.set.mockResolvedValue(undefined);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LocationStateService,
        { provide: AppStorageService, useValue: mockStorage },
      ],
    });
    service = TestBed.inject(LocationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set current coordinates and location name', () => {
    const coords = { latitude: 34.0522, longitude: -118.2437 };
    service.setCurrent(coords, 'Los Angeles');

    expect(service.snapshot.current).toEqual(coords);
    expect(service.snapshot.currentLocationName).toBe('Los Angeles');
  });

  it('should add a saved location and prevent duplicate coordinates', () => {
    const loc1 = service.addSavedLocation({
      name: 'Paris',
      country: 'FR',
      lat: 48.8566,
      lon: 2.3522,
    });

    expect(loc1).toBeTruthy();
    expect(service.snapshot.savedLocations.length).toBe(1);

    // Adding duplicate coordinates should return null
    const duplicate = service.addSavedLocation({
      name: 'Paris Duplicate',
      country: 'FR',
      lat: 48.8566,
      lon: 2.3522,
    });

    expect(duplicate).toBeNull();
    expect(service.snapshot.savedLocations.length).toBe(1);
    expect(mockStorage.set).toHaveBeenCalled();
  });

  it('should remove a saved location by id', () => {
    const loc = service.addSavedLocation({
      name: 'Berlin',
      country: 'DE',
      lat: 52.52,
      lon: 13.405,
    });

    expect(service.snapshot.savedLocations.length).toBe(1);
    service.removeSavedLocation(loc!.id);
    expect(service.snapshot.savedLocations.length).toBe(0);
    expect(mockStorage.set).toHaveBeenCalled();
  });

  it('should set active/current location id', () => {
    const loc = service.addSavedLocation({
      name: 'Rome',
      country: 'IT',
      lat: 41.9028,
      lon: 12.4964,
    });

    service.setCurrentLocationId(loc!.id);
    const updated = service.getSavedLocation(loc!.id);
    expect(updated?.isCurrent).toBe(true);
  });
});

