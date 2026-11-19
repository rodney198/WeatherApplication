/**
 * WeatherNow - Home Page (Main Weather Dashboard)
 * Displays current weather, hourly forecast, and weekly forecast.
 * Built with Angular standalone components and reactive signals for zoneless change detection.
 */

import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { distinctUntilChanged, skip } from 'rxjs/operators';

import {
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/angular';

import { WeatherStateService } from '../../core/services/state/weather-state.service';
import { LocationStateService } from '../../core/services/state/location-state.service';
import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { WeatherService } from '../../core/services/weather.service';
import { LocationService } from '../../core/services/location.service';
import { GeocodingService, CitySuggestion } from '../../core/services/geocoding.service';
import { getWeatherIcon } from '../../core/utils/weather-icon.util';
import {
  TemperaturePipe,
  WindSpeedPipe,
  DateTimePipe,
  PressurePipe,
  VisibilityPipe,
} from '../../shared/pipes/temperature.pipe';
import {
  ErrorStateComponent,
  EmptyStateComponent,
  WeatherIconComponent,
  AppNavComponent,
} from '../../shared/components/shared.components';
import { CurrentWeather } from '../../core/models/weather.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    IonSpinner,
    IonIcon,
    TemperaturePipe,
    WindSpeedPipe,
    DateTimePipe,
    PressurePipe,
    VisibilityPipe,
    ErrorStateComponent,
    EmptyStateComponent,
    WeatherIconComponent,
    AppNavComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly weatherState = inject(WeatherStateService);
  private readonly locationState = inject(LocationStateService);
  private readonly settings = inject(SettingsStateService);
  private readonly weatherService = inject(WeatherService);
  private readonly locationService = inject(LocationService);
  private readonly geocoding = inject(GeocodingService);
  private readonly destroyRef = inject(DestroyRef);

  // Toggle for expanded air conditions
  readonly showMoreConditions = signal(false);

  // Live in-dashboard search signals
  readonly homeSearchQuery = signal('');
  readonly homeSearchResults = signal<CitySuggestion[]>([]);
  readonly isSearchFocused = signal(false);

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

  // 6 key hourly intervals for "Today's Forecast"
  readonly todayForecast = computed(() => {
    const hours = this.hourly();
    if (hours.length <= 6) return hours;
    return hours.slice(0, 6);
  });

  // Chance of rain percentage for hero display
  readonly chanceOfRain = computed(() => {
    const firstHour = this.hourly()[0];
    if (firstHour?.pop !== undefined && firstHour.pop !== null) {
      return Math.round(firstHour.pop * 100);
    }
    const today = this.daily()[0];
    if (today?.pop !== undefined && today.pop !== null) {
      return Math.round(today.pop * 100);
    }
    return 0;
  });

  // Display-ready daily forecast (7 days)
  readonly next7Days = computed(() => this.daily().slice(0, 7));

  // Weekly temperature extremes for proportional daily forecast range bars
  readonly weekMinTemp = computed(() => {
    const days = this.daily();
    if (!days.length) return 0;
    return Math.min(...days.map((d) => d.temp.min));
  });

  readonly weekMaxTemp = computed(() => {
    const days = this.daily();
    if (!days.length) return 100;
    return Math.max(...days.map((d) => d.temp.max));
  });

  /**
   * Calculates the proportional position and width of the temperature range bar for a day
   */
  getTempBarRange(min: number, max: number): { left: string; width: string } {
    const overallMin = this.weekMinTemp();
    const overallMax = this.weekMaxTemp();
    const diff = overallMax - overallMin || 1;
    const left = Math.max(0, Math.min(100, ((min - overallMin) / diff) * 100));
    const right = Math.max(0, Math.min(100, ((max - overallMin) / diff) * 100));
    const width = Math.max(14, right - left);
    return {
      left: `${left.toFixed(1)}%`,
      width: `${width.toFixed(1)}%`,
    };
  }

  ngOnInit(): void {
    this.initializeWeather();

    // Dynamically re-fetch weather in new units when temperature unit setting changes
    this.settings.temperatureUnit$
      .pipe(
        distinctUntilChanged(),
        skip(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const coords = this.locationState.snapshot.current;
        if (coords) {
          this.fetchWeather(coords.latitude, coords.longitude, true);
        }
      });
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
          .subscribe({
            next: (cityName) => {
              this.locationState.setCurrent(position.coordinates, cityName);
              this.fetchWeather(position.coordinates.latitude, position.coordinates.longitude);
            },
            error: () => {
              this.fetchWeather(position.coordinates.latitude, position.coordinates.longitude);
            },
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
   * Manual refresh trigger from header, nav or pull-to-refresh
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
   * Switch to demo mode while waiting for live API key activation
   */
  loadDemoWeather(): void {
    const coords = this.locationState.snapshot.current || { latitude: 40.7128, longitude: -74.006 };
    this.weatherState.setLoading(true);
    this.weatherState.setError(null);
    const demo = (this.weatherService as any).createMockWeatherResponse(
      coords.latitude,
      coords.longitude,
      this.temperatureUnit(),
    );
    this.weatherState.setWeather(demo);
    this.weatherState.setLoading(false);
  }

  /**
   * Handle pull-to-refresh
   */
  async onRefresh(event?: any): Promise<void> {
    try {
      await this.refreshWeather();
    } finally {
      if (event?.target?.complete) {
        event.target.complete();
      }
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
          this.weatherState.setLoading(false);
        },
        error: (err) => {
          this.weatherState.setError(err?.message || 'Failed to fetch weather data');
          this.weatherState.setLoading(false);
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
            this.weatherState.setLoading(false);
            resolve();
          },
          error: (err) => {
            this.weatherState.setError(err?.message || 'Failed to fetch weather data');
            this.weatherState.setLoading(false);
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
   * Formats high and low temperatures as 'High/Low' (e.g. 36/22)
   */
  formatHighLow(max: number, min: number): string {
    return `${Math.round(max)}/${Math.round(min)}`;
  }

  /**
   * Extracts clean weather condition name (e.g. Sunny, Cloudy, Rainy, Storm)
   */
  getConditionTitle(description: string | undefined): string {
    if (!description) return 'Sunny';
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return 'Sunny';
    if (desc.includes('thunder') || desc.includes('storm')) return 'Storm';
    if (desc.includes('rain') || desc.includes('drizzle')) return 'Rainy';
    if (desc.includes('snow')) return 'Snow';
    if (desc.includes('cloud')) return 'Cloudy';
    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  /**
   * Toggle expanded air conditions
   */
  toggleAirConditions(): void {
    this.showMoreConditions.update((v) => !v);
  }

  /**
   * Navigate to search page
   */
  onSearchClick(): void {
    this.router.navigate(['/search']);
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

  /**
   * Handle user typing in the top search bar for instant auto-complete
   */
  onHomeSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement)?.value || '';
    this.homeSearchQuery.set(val);
    this.isSearchFocused.set(true);

    if (val.trim().length >= 2) {
      this.geocoding.searchCities({ query: val.trim(), limit: 6 }).subscribe((results) => {
        this.homeSearchResults.set(results);
      });
    } else {
      this.homeSearchResults.set([]);
    }
  }

  /**
   * Select a city directly from the search dropdown
   */
  selectHomeCity(city: CitySuggestion): void {
    const displayName = city.state
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`;

    this.locationState.setCurrent({ latitude: city.lat, longitude: city.lon }, displayName);
    this.homeSearchQuery.set('');
    this.homeSearchResults.set([]);
    this.isSearchFocused.set(false);
    this.fetchWeather(city.lat, city.lon, true);
  }

  /**
   * Clear home search input
   */
  clearHomeSearch(): void {
    this.homeSearchQuery.set('');
    this.homeSearchResults.set([]);
    this.isSearchFocused.set(false);
  }

  /**
   * Handle enter key on home search
   */
  onSearchSubmit(): void {
    const results = this.homeSearchResults();
    if (results.length > 0) {
      this.selectHomeCity(results[0]);
    } else if (this.homeSearchQuery().trim().length >= 2) {
      this.router.navigate(['/search']);
    }
  }

  /**
   * Check if a city from search is in saved locations
   */
  isCitySaved(city: CitySuggestion): boolean {
    return this.savedLocations().some(
      (loc) => Math.abs(loc.lat - city.lat) < 0.01 && Math.abs(loc.lon - city.lon) < 0.01,
    );
  }

  /**
   * Toggle saving a search result directly
   */
  toggleSaveSearchCity(city: CitySuggestion): void {
    const existing = this.savedLocations().find(
      (loc) => Math.abs(loc.lat - city.lat) < 0.01 && Math.abs(loc.lon - city.lon) < 0.01,
    );
    if (existing) {
      this.locationState.removeSavedLocation(existing.id);
    } else {
      this.locationState.addSavedLocation({
        name: city.name,
        state: city.state,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      });
    }
  }

  /**
   * Handle clicking the Weather tab in the sidebar/bottom nav
   */
  onWeatherNavClick(): void {
    this.refreshWeather();
  }

  /**
   * Handle clicking the Weather Hero card
   */
  onWeatherHeroClick(): void {
    this.refreshWeather();
  }
}
