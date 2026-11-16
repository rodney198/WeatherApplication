/**
 * WeatherNow - Home Page (Main Weather Dashboard)
 * Displays current weather, hourly forecast, and weekly forecast.
 * Built with Angular standalone components and reactive signals for zoneless change detection.
 */

import { Component, inject, computed, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PercentPipe, TitleCasePipe } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
} from '@ionic/angular';

import { WeatherStateService } from '../../core/services/state/weather-state.service';
import { LocationStateService } from '../../core/services/state/location-state.service';
import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { WeatherService } from '../../core/services/weather.service';
import { LocationService } from '../../core/services/location.service';
import { GeocodingService } from '../../core/services/geocoding.service';
import { getWeatherIcon } from '../../core/utils/weather-icon.util';
import {
  TemperaturePipe,
  WindDirectionPipe,
  WindSpeedPipe,
  DateTimePipe,
  PressurePipe,
  VisibilityPipe,
} from '../../shared/pipes/temperature.pipe';
import {
  ErrorStateComponent,
  EmptyStateComponent,
  WeatherIconComponent,
} from '../../shared/components/shared.components';
import { CurrentWeather } from '../../core/models/weather.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
    PercentPipe,
    TitleCasePipe,
    TemperaturePipe,
    WindDirectionPipe,
    WindSpeedPipe,
    DateTimePipe,
    PressurePipe,
    VisibilityPipe,
    ErrorStateComponent,
    EmptyStateComponent,
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

  // Reactive state signals for robust zoneless change detection
  readonly current = toSignal(this.weatherState.current$, { initialValue: null });
  readonly hourly = toSignal(this.weatherState.hourly$, { initialValue: [] });
  readonly daily = toSignal(this.weatherState.daily$, { initialValue: [] });
  readonly loading = toSignal(this.weatherState.loading$, { initialValue: false });
  readonly errorMessage = toSignal(this.weatherState.error$, { initialValue: null });
  readonly hasData = toSignal(this.weatherState.hasData$, { initialValue: false });

  readonly currentLocationName = toSignal(this.locationState.currentLocationName$, {
    initialValue: 'Your Location',
  });
  readonly temperatureUnit = toSignal(this.settings.temperatureUnit$, {
    initialValue: this.settings.snapshot.temperatureUnit,
  });
  readonly savedLocations = toSignal(this.locationState.savedLocations$, {
    initialValue: [],
  });

  // Computed signal to check if the current active location is in saved locations
  readonly isSavedLocation = computed(() => {
    const currentLoc = this.locationState.snapshot.current;
    if (!currentLoc) return false;
    return this.savedLocations().some(
      (loc) =>
        Math.abs(loc.lat - currentLoc.latitude) < 0.01 &&
        Math.abs(loc.lon - currentLoc.longitude) < 0.01,
    );
  });

  // Display-ready hourly forecast (first 24 hours)
  readonly next24Hours = computed(() => this.hourly().slice(0, 24));

  // Display-ready daily forecast (7 days)
  readonly next7Days = computed(() => this.daily().slice(0, 7));

  ngOnInit(): void {
    this.initializeWeather();
  }

  /**
   * Initializes weather retrieval: checks current coordinates, requests device location if unset,
   * or falls back to a sensible default.
   */
  async initializeWeather(): Promise<void> {
    const currentCoords = this.locationState.snapshot.current;
    if (currentCoords) {
      this.fetchWeather(currentCoords.latitude, currentCoords.longitude);
      return;
    }

    // Try requesting device geolocation
    try {
      this.weatherState.setLoading(true);
      const hasPermission = await this.locationService.checkPermission();
      if (hasPermission) {
        const position = await this.locationService.getCurrentPositionAsync();
        this.locationService.cachePosition(position.coordinates);
        this.geocoding
          .reverseGeocode(position.coordinates.latitude, position.coordinates.longitude)
          .subscribe((cityName) => {
            this.locationState.setCurrent(position.coordinates, cityName);
            this.fetchWeather(position.coordinates.latitude, position.coordinates.longitude);
          });
        return;
      }
    } catch {
      // Permission denied or unavailable - fallback to default location
    }

    // Fallback default coordinates (New York City)
    const fallbackLat = 40.7128;
    const fallbackLon = -74.006;
    if (!this.locationState.snapshot.currentLocationName) {
      this.locationState.setCurrent(
        { latitude: fallbackLat, longitude: fallbackLon },
        'New York, US',
      );
    }
    this.fetchWeather(fallbackLat, fallbackLon);
  }

  /**
   * Manual refresh trigger from header or pull-to-refresh
   */
  async refreshWeather(): Promise<void> {
    const coords = this.locationState.snapshot.current;
    if (coords) {
      await this.fetchWeatherPromise(coords.latitude, coords.longitude, true);
    } else {
      await this.initializeWeather();
    }
  }

  /**
   * Handle pull-to-refresh
   */
  async onRefresh(event: { target: HTMLIonRefresherElement }): Promise<void> {
    try {
      await this.refreshWeather();
    } finally {
      event.target.complete();
    }
  }

  /**
   * Toggle saving the current location to favorites
   */
  toggleSaveLocation(): void {
    const coords = this.locationState.snapshot.current;
    const name = this.currentLocationName() || 'Saved Location';
    if (!coords) return;

    const existing = this.savedLocations().find(
      (loc) =>
        Math.abs(loc.lat - coords.latitude) < 0.01 &&
        Math.abs(loc.lon - coords.longitude) < 0.01,
    );

    if (existing) {
      this.locationState.removeSavedLocation(existing.id);
    } else {
      this.locationState.addSavedLocation({
        name,
        country: '',
        lat: coords.latitude,
        lon: coords.longitude,
      });
    }
  }

  /**
   * Fetch weather data for given coordinates
   */
  private fetchWeather(lat: number, lon: number, forceRefresh = false): void {
    this.weatherState.setLoading(true);
    this.weatherState.setError(null);

    this.weatherService
      .fetchWeather({ lat, lon, units: this.temperatureUnit(), forceRefresh })
      .subscribe({
        next: (data) => {
          this.weatherState.setWeather(data);
        },
        error: (err) => {
          this.weatherState.setError(err?.message || 'Failed to fetch weather data');
        },
      });
  }

  private fetchWeatherPromise(lat: number, lon: number, forceRefresh = false): Promise<void> {
    return new Promise((resolve) => {
      this.weatherState.setLoading(true);
      this.weatherState.setError(null);

      this.weatherService
        .fetchWeather({ lat, lon, units: this.temperatureUnit(), forceRefresh })
        .subscribe({
          next: (data) => {
            this.weatherState.setWeather(data);
            resolve();
          },
          error: (err) => {
            this.weatherState.setError(err?.message || 'Failed to fetch weather data');
            resolve();
          },
        });
    });
  }

  /**
   * Weather icon helper
   */
  getIcon(code: string): string {
    return getWeatherIcon(code);
  }

  /**
   * Strongly typed temperature high accessor
   */
  getTempHigh(current: CurrentWeather): number {
    return current.temp_max ?? current.temp;
  }

  /**
   * Strongly typed temperature low accessor
   */
  getTempLow(current: CurrentWeather): number {
    return current.temp_min ?? current.temp;
  }
}
