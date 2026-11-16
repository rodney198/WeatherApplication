/**
 * WeatherNow - Native Integration Service
 * Handles Capacitor native plugin integration: Status Bar, Geolocation, Preferences.
 * Provides platform-specific configuration and permission handling.
 */

import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { StatusBar } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export interface NativeCapabilities {
  geolocation: boolean;
  preferences: boolean;
  statusBar: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NativeService {
  private readonly platform = inject(Platform);
  private readonly isNative = !this.platform.is('mobileweb');

  /**
   * Check if running on a native platform (iOS/Android).
   */
  get isNativePlatform(): boolean {
    return this.isNative;
  }

  /**
   * Initialize status bar styling for the current platform.
   */
  async initializeStatusBar(): Promise<void> {
    if (!this.isNative) return;

    try {
      const style = this.platform.is('ios') ? 'dark' : 'light';
      await StatusBar.setStyle({ style });
      await StatusBar.show();
    } catch (error) {
      console.error('[Native] Failed to initialize status bar', error);
    }
  }

  /**
   * Request location permission and return whether granted.
   */
  async requestLocationPermission(): Promise<boolean> {
    if (!this.isNative) return true; // Web uses browser permissions

    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted' || permission.coarseLocation === 'granted';
    } catch (error) {
      console.error('[Native] Location permission request failed', error);
      return false;
    }
  }

  /**
   * Check if location permission is granted.
   */
  async hasLocationPermission(): Promise<boolean> {
    if (!this.isNative) return true;

    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted' || permission.coarseLocation === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Save data to persistent storage (Capacitor Preferences).
   */
  async saveToStorage(key: string, value: unknown): Promise<void> {
    try {
      await Preferences.set({ key, value: JSON.stringify(value) });
    } catch (error) {
      console.error(`[Native] Failed to save "${key}"`, error);
      throw error;
    }
  }

  /**
   * Load data from persistent storage.
   */
  async loadFromStorage<T>(key: string): Promise<T | null> {
    try {
      const result = await Preferences.get({ key });
      if (!result.value) return null;
      return JSON.parse(result.value) as T;
    } catch (error) {
      console.error(`[Native] Failed to load "${key}"`, error);
      return null;
    }
  }

  /**
   * Remove data from persistent storage.
   */
  async removeFromStorage(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`[Native] Failed to remove "${key}"`, error);
      throw error;
    }
  }

  /**
   * Listen for app state changes (foreground/background).
   */
  onAppStateChange(callback: (state: 'active' | 'background') => void): () => void {
    if (!this.isNative) return () => {};

    const handler = App.addListener('appStateChange', (state: { isActive: boolean }) => {
      callback(state.isActive ? 'active' : 'background');
    });

    return () => handler.then((h) => h.remove());
  }
}