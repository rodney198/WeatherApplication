/**
 * WeatherNow - Settings State Service
 * Reactive state for user preferences (temperature unit, default location).
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { SettingsState, TemperatureUnit, DEFAULT_SETTINGS } from '../../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsStateService {
  private readonly state$ = new BehaviorSubject<SettingsState>({ ...DEFAULT_SETTINGS });

  readonly settings$ = this.state$.asObservable();
  readonly temperatureUnit$ = this.state$.pipe(map((s) => s.temperatureUnit));
  readonly defaultLocationId$ = this.state$.pipe(map((s) => s.defaultLocationId));
  readonly hasCompletedOnboarding$ = this.state$.pipe(map((s) => s.hasCompletedOnboarding));

  get snapshot(): SettingsState {
    return this.state$.value;
  }

  /**
   * Set temperature unit (metric = Celsius, imperial = Fahrenheit).
   */
  setTemperatureUnit(unit: TemperatureUnit): void {
    this.update({ temperatureUnit: unit });
  }

  /**
   * Set the default location id.
   */
  setDefaultLocationId(id: string | null): void {
    this.update({ defaultLocationId: id });
  }

  /**
   * Mark onboarding as completed.
   */
  completeOnboarding(): void {
    this.update({ hasCompletedOnboarding: true });
  }

  /**
   * Load settings from storage and update state.
   */
  loadSettings(settings: Partial<SettingsState>): void {
    this.state$.next({ ...DEFAULT_SETTINGS, ...settings });
  }

  private update(partial: Partial<SettingsState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }
}