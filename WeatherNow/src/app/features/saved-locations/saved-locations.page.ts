/**
 * WeatherNow - Saved Locations Page
 * Allows users to view, switch, and delete bookmarked favorite cities.
 */

import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonAlert,
} from '@ionic/angular';

import { LocationStateService } from '../../core/services/state/location-state.service';
import { WeatherStateService } from '../../core/services/state/weather-state.service';
import { WeatherService } from '../../core/services/weather.service';
import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { SavedLocation } from '../../core/models/location.model';
import { AppNavComponent } from '../../shared/components/shared.components';

@Component({
  selector: 'app-saved-locations',
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonAlert,
    AppNavComponent,
  ],
  templateUrl: './saved-locations.page.html',
  styleUrls: ['./saved-locations.page.scss'],
})
export class SavedLocationsPage {
  private readonly locationState = inject(LocationStateService);
  private readonly weatherState = inject(WeatherStateService);
  private readonly weatherService = inject(WeatherService);
  private readonly settings = inject(SettingsStateService);
  private readonly router = inject(Router);

  readonly savedLocations = toSignal(this.locationState.savedLocations$, {
    initialValue: [],
  });

  readonly showDeleteAlert = signal(false);
  private deletingLocationId: string | null = null;

  readonly alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => this.cancelDelete(),
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.confirmDelete(),
    },
  ];

  readonly quickSuggestions = [
    { name: 'London', country: 'GB', state: 'England', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', country: 'JP', state: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', state: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
    { name: 'Madrid', country: 'ES', state: 'Community of Madrid', lat: 40.4168, lon: -3.7038 },
  ];

  onSwitchLocation(location: SavedLocation): void {
    const displayName = location.state
      ? `${location.name}, ${location.state}, ${location.country}`
      : (location.country ? `${location.name}, ${location.country}` : location.name);

    this.locationState.setCurrent({ latitude: location.lat, longitude: location.lon }, displayName);
    this.locationState.setCurrentLocationId(location.id);

    this.weatherState.setLoading(true);
    this.weatherState.setError(null);

    this.weatherService
      .fetchWeather({
        lat: location.lat,
        lon: location.lon,
        units: this.settings.snapshot.temperatureUnit,
        forceRefresh: true,
      })
      .subscribe({
        next: (data) => {
          this.weatherState.setWeather(data);
          this.weatherState.setLoading(false);
          this.router.navigate(['/home']);
        },
        error: () => {
          const fallback = (this.weatherService as any).createMockWeatherResponse(
            location.lat,
            location.lon,
            this.settings.snapshot.temperatureUnit,
          );
          this.weatherState.setWeather(fallback);
          this.weatherState.setLoading(false);
          this.router.navigate(['/home']);
        },
      });
  }

  addQuickCity(city: { name: string; country: string; state?: string; lat: number; lon: number }): void {
    this.locationState.addSavedLocation(city);
  }

  onDeleteLocation(location: SavedLocation): void {
    this.deletingLocationId = location.id;
    this.showDeleteAlert.set(true);
  }

  confirmDelete(): void {
    if (this.deletingLocationId) {
      this.locationState.removeSavedLocation(this.deletingLocationId);
    }
    this.showDeleteAlert.set(false);
    this.deletingLocationId = null;
  }

  cancelDelete(): void {
    this.showDeleteAlert.set(false);
    this.deletingLocationId = null;
  }
}
