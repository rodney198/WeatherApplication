/**
 * WeatherNow - Search Page
 * City search functionality with debounced input and suggestions.
 */

import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonSearchbar, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular';
import { IonIcon } from '@ionic/angular';

import { GeocodingService } from '../../core/services/geocoding.service';
import { WeatherService } from '../../core/services/weather.service';
import { LocationStateService } from '../../core/services/state/location-state.service';
import { WeatherStateService } from '../../core/services/state/weather-state.service';
import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { CitySuggestion } from '../../core/services/geocoding.service';

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
    IonIcon,
  ],
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  private readonly geocoding = inject(GeocodingService);
  private readonly weatherService = inject(WeatherService);
  private readonly locationState = inject(LocationStateService);
  private readonly weatherState = inject(WeatherStateService);
  private readonly settings = inject(SettingsStateService);
  private readonly router = inject(Router);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = this.fb.control('', [Validators.required, Validators.minLength(2)]);
  readonly suggestions = signal<CitySuggestion[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly noResults = signal(false);

  constructor() {}

  onSearchInput(event: Event): void {
    const input = event.target as HTMLIonSearchbarElement;
    const query = input.value || '';
    this.searchControl.setValue(query);
    this.noResults.set(false);
    this.error.set(null);

    if (query.length < 2) {
      this.suggestions.set([]);
      return;
    }

    this.loading.set(true);
    this.geocoding
      .searchCities({ query, limit: 5 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => {
          this.suggestions.set(results);
          this.noResults.set(results.length === 0);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Search failed. Please try again.');
          this.loading.set(false);
        },
      });
  }

  onCitySelect(city: CitySuggestion): void {
    this.locationState.setCurrent({ latitude: city.lat, longitude: city.lon }, city.name);
    this.weatherState.setLoading(true);
    this.weatherState.setError(null);

    this.weatherService
      .fetchWeather({ lat: city.lat, lon: city.lon, units: this.settings.snapshot.temperatureUnit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.weatherState.setWeather(data);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.weatherState.setError(err?.message || 'Failed to fetch weather');
        },
      });
  }
}