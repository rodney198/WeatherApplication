/**
 * WeatherNow - Home Page (Main Weather Dashboard)
 * Displays current weather, hourly forecast, and weekly forecast.
 * This is the primary view of the application.
 */

import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PercentPipe, AsyncPipe, TitleCasePipe } from '@angular/common';

import { IonContent, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { IonIcon } from '@ionic/angular';

import { WeatherStateService } from '../../core/services/state/weather-state.service';
import { LocationStateService } from '../../core/services/state/location-state.service';
import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { WeatherService } from '../../core/services/weather.service';
import { LocationService } from '../../core/services/location.service';
import { GeocodingService } from '../../core/services/geocoding.service';
import { getWeatherIcon } from '../../core/utils/weather-icon.util';
import { TemperaturePipe, WindDirectionPipe, WindSpeedPipe, DateTimePipe, PressurePipe, VisibilityPipe } from '../../shared/pipes/temperature.pipe';
import { ErrorStateComponent, EmptyStateComponent, LoadingSkeletonComponent, WeatherIconComponent } from '../../shared/components/shared.components';
import { CurrentWeather, HourlyForecast, DailyForecast } from '../../core/models/weather.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
    PercentPipe,
    AsyncPipe,
    TitleCasePipe,
    TemperaturePipe,
    WindDirectionPipe,
    WindSpeedPipe,
    DateTimePipe,
    PressurePipe,
    VisibilityPipe,
    ErrorStateComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    WeatherIconComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly weatherState = inject(WeatherStateService);
  private readonly locationState = inject(LocationStateService);
  private readonly settings = inject(SettingsStateService);
  private readonly weatherService = inject(WeatherService);
  private readonly locationService = inject(LocationService);
  private readonly geocoding = inject(GeocodingService);
  private readonly destroyRef = inject(DestroyRef);

  // Synchronous state for template rendering
  current: CurrentWeather | null = null;
  hourly: HourlyForecast[] = [];
  daily: DailyForecast[] = [];
  loading = false;
  private _error: string | null = null;
  hasData = false;

  readonly temperatureUnit = this.settings.snapshot.temperatureUnit;
  readonly currentLocationName = computed(
    () => this.locationState.snapshot.currentLocationName || 'Your Location',
  );

  /** Error message for template (safe string). */
  get errorMessage(): string {
    return this._error || '';
  }

  constructor() {}

  ngOnInit(): void {
    this.subscribeToState();
    this.loadWeather();
  }

  /**
   * Subscribe to weather state changes.
   */
  private subscribeToState(): void {
    this.weatherState.weather$.subscribe((state) => {
      this.current = state.current;
      this.hourly = state.hourly;
      this.daily = state.daily;
      this.loading = state.loading;
      this._error = state.error;
      this.hasData = state.current !== null;
    });
  }

  /**
   * Load weather data for current location or default location.
   */
  loadWeather(): void {
    const coords = this.locationState.snapshot.current;
    if (coords) {
      this.fetchWeather(coords.latitude, coords.longitude);
    }
  }

  /**
   * Fetch weather data for given coordinates.
   */
  private fetchWeather(lat: number, lon: number): void {
    this.weatherState.setLoading(true);
    this.weatherState.setError(null);

    this.weatherService
      .fetchWeather({ lat, lon, units: this.temperatureUnit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.weatherState.setWeather(data);
        },
        error: (err) => {
          this.weatherState.setError(err?.message || 'Failed to fetch weather data');
        },
      });
  }

  /**
   * Handle pull-to-refresh.
   */
  onRefresh(event: any): void {
    this.loadWeather();
    setTimeout(() => event.target.complete(), 1500);
  }

  /**
   * Get weather icon code.
   */
  getIcon(code: string): string {
    return getWeatherIcon(code);
  }

  /**
   * Get high temperature (defaults to current temp if not available).
   */
  getTempHigh(current: CurrentWeather): number {
    return (current as any).temp_max ?? current.temp;
  }

  /**
   * Get low temperature (defaults to current temp if not available).
   */
  getTempLow(current: CurrentWeather): number {
    return (current as any).temp_min ?? current.temp;
  }

  /**
   * Get sunrise timestamp (safe access).
   */
  getSunrise(current: CurrentWeather): number {
    return current.sunrise;
  }

  /**
   * Get sunset timestamp (safe access).
   */
  getSunset(current: CurrentWeather): number {
    return current.sunset;
  }

  /** Template-safe accessor to avoid null-check issues. */
  getCurrent(): CurrentWeather | null {
    return this.current;
  }
}