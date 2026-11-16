/**
 * WeatherNow - Settings State Service
 * Reactive state for user preferences (temperature unit, default location).
 * Persists settings to Capacitor Preferences via AppStorageService.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import { SettingsState, TemperatureUnit, DEFAULT_SETTINGS } from '../../models/settings.model';
import { AppStorageService } from '../storage.service';

const SETTINGS_STORAGE_KEY = 'weathernow_user_settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsStateService {
  private readonly storage = inject(AppStorageService);
  private readonly state$ = new BehaviorSubject<SettingsState>({ ...DEFAULT_SETTINGS });

  readonly settings$ = this.state$.asObservable();
  readonly temperatureUnit$ = this.state$.pipe(map((s) => s.temperatureUnit));
  readonly defaultLocationId$ = this.state$.pipe(map((s) => s.defaultLocationId));
  readonly hasCompletedOnboarding$ = this.state$.pipe(map((s) => s.hasCompletedOnboarding));

  get snapshot(): SettingsState {
    return this.state$.value;
  }

  constructor() {
    this.loadPersistedSettings();
  }

  private async loadPersistedSettings(): Promise<void> {
    try {
      const persisted = await this.storage.get<SettingsState>(SETTINGS_STORAGE_KEY);
      if (persisted) {
        this.state$.next({ ...DEFAULT_SETTINGS, ...persisted });
      }
    } catch (e) {
      console.warn('[SettingsState] Failed to load persisted settings', e);
    }
  }

  private async persistSettings(): Promise<void> {
    try {
      await this.storage.set(SETTINGS_STORAGE_KEY, this.snapshot);
    } catch (e) {
      console.warn('[SettingsState] Failed to persist settings', e);
    }
  }

  /**
   * Set temperature unit (metric = Celsius, imperial = Fahrenheit).
   */
  setTemperatureUnit(unit: TemperatureUnit): void {
    this.update({ temperatureUnit: unit });
    this.persistSettings();
  }

  /**
   * Set the default location id.
   */
  setDefaultLocationId(id: string | null): void {
    this.update({ defaultLocationId: id });
    this.persistSettings();
  }

  /**
   * Mark onboarding as completed.
   */
  completeOnboarding(): void {
    this.update({ hasCompletedOnboarding: true });
    this.persistSettings();
  }

  /**
   * Load settings from storage and update state.
   */
  loadSettings(settings: Partial<SettingsState>): void {
    this.state$.next({ ...DEFAULT_SETTINGS, ...settings });
    this.persistSettings();
  }

  private update(partial: Partial<SettingsState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }
}
