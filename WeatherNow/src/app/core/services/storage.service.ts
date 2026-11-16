/**
 * WeatherNow - Storage Service
 * Abstraction over Capacitor Preferences for persistent storage.
 * Provides a consistent API for saving/loading user preferences and locations.
 */

import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class AppStorageService implements StorageService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await Preferences.get({ key });
      if (result.value === null || result.value === undefined) return null;
      return JSON.parse(result.value) as T;
    } catch (error) {
      console.error(`[Storage] Failed to get key "${key}"`, error);
      return null;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      await Preferences.set({ key, value: JSON.stringify(value) });
    } catch (error) {
      console.error(`[Storage] Failed to set key "${key}"`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`[Storage] Failed to remove key "${key}"`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('[Storage] Failed to clear storage', error);
      throw error;
    }
  }
}