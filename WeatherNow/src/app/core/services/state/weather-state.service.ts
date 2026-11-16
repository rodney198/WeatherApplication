/**
 * WeatherNow - Weather State Service
 * Reactive state management for weather data using RxJS BehaviorSubject.
 * Single source of truth, prevents duplicate API calls.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, take } from 'rxjs';

import {
  WeatherResponse,
  WeatherState,
  EMPTY_WEATHER_STATE,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
} from '../../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherStateService {
  private readonly state$ = new BehaviorSubject<WeatherState>(EMPTY_WEATHER_STATE);

  /** Read-only observable of the full weather state. */
  readonly weather$ = this.state$.asObservable();

  /** Current weather data observable. */
  readonly current$ = this.state$.pipe(
    filter((s) => s.current !== null),
    map((s) => s.current as CurrentWeather),
  );

  /** Hourly forecast observable. */
  readonly hourly$ = this.state$.pipe(map((s) => s.hourly));

  /** Daily forecast observable. */
  readonly daily$ = this.state$.pipe(map((s) => s.daily));

  /** Loading state observable. */
  readonly loading$ = this.state$.pipe(map((s) => s.loading));

  /** Error state observable. */
  readonly error$ = this.state$.pipe(map((s) => s.error));

  /** Whether weather data is available. */
  readonly hasData$ = this.state$.pipe(map((s) => s.current !== null));

  /** Get current snapshot of state. */
  get snapshot(): WeatherState {
    return this.state$.value;
  }

  /**
   * Set loading state.
   */
  setLoading(loading: boolean): void {
    this.update({ loading });
  }

  /**
   * Set error state.
   */
  setError(error: string | null): void {
    this.update({ error, loading: false });
  }

  /**
   * Store successful weather response.
   */
  setWeather(response: WeatherResponse): void {
    this.update({
      current: response.current,
      hourly: response.hourly || [],
      daily: response.daily || [],
      lastUpdated: Date.now(),
      loading: false,
      error: null,
    });
  }

  /**
   * Clear all weather data.
   */
  clear(): void {
    this.state$.next(EMPTY_WEATHER_STATE);
  }

  /**
   * Get current weather synchronously (for non-reactive access).
   */
  getCurrent(): CurrentWeather | null {
    return this.snapshot.current;
  }

  private update(partial: Partial<WeatherState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  /** Get a one-time snapshot of current weather. */
  getCurrentOnce(): Observable<CurrentWeather | null> {
    return this.current$.pipe(take(1));
  }
}