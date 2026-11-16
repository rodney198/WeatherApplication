/**
 * WeatherNow - Search Page
 * City search functionality with debounced input, suggestions, and favorite bookmarking.
 */

import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonButton,
  IonIcon,
} from '@ionic/angular';

import { GeocodingService, CitySuggestion } from '../../core/services/geocoding.service';
import { WeatherService } from '../../core/services/weather.service';
import { LocationStateService } from '../../core/services/state/location-state.service';
import { WeatherStateService } from '../../core/services/state/weather-state.service';
import { SettingsStateService } from '../../core/services/state/settings-state.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonButton,
    IonIcon,
  ],
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  private readonly geocoding = inject(GeocodingService);
  private readonly weatherService = inject(WeatherService);
  private readonly locationState = inject(LocationStateService);
  private readonly weatherState = inject(WeatherStateService);
  private readonly settings = inject(SettingsStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject$ = new Subject<string>();

  readonly searchQuery = signal('');
  readonly suggestions = signal<CitySuggestion[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly noResults = signal(false);

  ngOnInit(): void {
    this.setupDebouncedSearch();
  }

  private setupDebouncedSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          this.searchQuery.set(query);
          this.error.set(null);
          this.noResults.set(false);
          if (query.trim().length < 2) {
            this.suggestions.set([]);
            this.loading.set(false);
          } else {
            this.loading.set(true);
          }
        }),
        switchMap((query) => {
          if (query.trim().length < 2) {
            return [];
          }
          return this.geocoding.searchCities({ query: query.trim(), limit: 7 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (results) => {
          this.loading.set(false);
          this.suggestions.set(results);
          if (this.searchQuery().trim().length >= 2) {
            this.noResults.set(results.length === 0);
          }
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Search failed. Please check connection and try again.');
        },
      });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLIonSearchbarElement;
    const query = input?.value || '';
    this.searchSubject$.next(query);
  }

  onCitySelect(city: CitySuggestion): void {
    const locationName = city.state
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`;

    this.locationState.setCurrent({ latitude: city.lat, longitude: city.lon }, locationName);
    this.weatherState.setLoading(true);
    this.weatherState.setError(null);

    this.weatherService
      .fetchWeather({
        lat: city.lat,
        lon: city.lon,
        units: this.settings.snapshot.temperatureUnit,
        forceRefresh: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.weatherState.setWeather(data);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.weatherState.setError(err?.message || 'Failed to fetch weather');
          this.router.navigate(['/home']);
        },
      });
  }

  isCitySaved(city: CitySuggestion): boolean {
    return this.locationState.snapshot.savedLocations.some(
      (loc) => Math.abs(loc.lat - city.lat) < 0.001 && Math.abs(loc.lon - city.lon) < 0.001,
    );
  }

  toggleSaveCity(city: CitySuggestion, event: Event): void {
    event.stopPropagation();
    const existing = this.locationState.snapshot.savedLocations.find(
      (loc) => Math.abs(loc.lat - city.lat) < 0.001 && Math.abs(loc.lon - city.lon) < 0.001,
    );

    if (existing) {
      this.locationState.removeSavedLocation(existing.id);
    } else {
      this.locationState.addSavedLocation({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
      });
    }
  }
}
