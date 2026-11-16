/**
 * WeatherNow - Settings State Service Tests
 * Unit tests for user preferences and persistent storage.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { SettingsStateService } from './settings-state.service';
import { AppStorageService } from '../storage.service';

const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
};

describe('SettingsStateService', () => {
  let service: SettingsStateService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue(undefined);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SettingsStateService,
        { provide: AppStorageService, useValue: mockStorage },
      ],
    });
    service = TestBed.inject(SettingsStateService);
  });

  it('should be created with default settings', () => {
    expect(service).toBeTruthy();
    expect(service.snapshot.temperatureUnit).toBe('metric');
  });

  it('should toggle temperature unit between metric and imperial', () => {
    service.setTemperatureUnit('imperial');
    expect(service.snapshot.temperatureUnit).toBe('imperial');
    expect(mockStorage.set).toHaveBeenCalled();

    service.setTemperatureUnit('metric');
    expect(service.snapshot.temperatureUnit).toBe('metric');
  });

  it('should set default location id and persist', () => {
    service.setDefaultLocationId('loc_test_123');
    expect(service.snapshot.defaultLocationId).toBe('loc_test_123');
    expect(mockStorage.set).toHaveBeenCalled();
  });

  it('should complete onboarding and persist', () => {
    service.completeOnboarding();
    expect(service.snapshot.hasCompletedOnboarding).toBe(true);
    expect(mockStorage.set).toHaveBeenCalled();
  });
});

