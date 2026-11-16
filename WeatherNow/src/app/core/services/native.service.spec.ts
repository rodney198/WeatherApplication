/**
 * WeatherNow - Native Service Tests
 * Unit tests for Capacitor native plugins wrapper.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

import { NativeService } from './native.service';

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setStyle: vi.fn(),
    setBackgroundColor: vi.fn(),
    show: vi.fn(),
  },
  Style: {
    Dark: 'DARK',
    Light: 'LIGHT',
  },
}));

vi.mock('@capacitor/splash-screen', () => ({
  SplashScreen: {
    hide: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
  },
}));

describe('NativeService', () => {
  let service: NativeService;
  let mockPlatform: { is: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatform = {
      is: vi.fn((platformName: string) => platformName === 'capacitor' || platformName === 'ios'),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        NativeService,
        { provide: Platform, useValue: mockPlatform },
      ],
    });
    service = TestBed.inject(NativeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect native platform correctly', () => {
    expect(service.isNativePlatform).toBe(true);
  });

  it('should initialize status bar on native platform', async () => {
    await service.initializeStatusBar();
    expect(StatusBar.setStyle).toHaveBeenCalled();
    expect(StatusBar.show).toHaveBeenCalled();
  });

  it('should hide splash screen on native platform', async () => {
    await service.hideSplashScreen();
    expect(SplashScreen.hide).toHaveBeenCalledWith({ fadeOutDuration: 400 });
  });

  it('should register app state change listener', () => {
    const mockRemove = vi.fn();
    vi.mocked(App.addListener).mockResolvedValueOnce({ remove: mockRemove } as any);

    const callback = vi.fn();
    const unsubscribe = service.onAppStateChange(callback);

    expect(App.addListener).toHaveBeenCalledWith('appStateChange', expect.any(Function));
    unsubscribe();
  });
});
