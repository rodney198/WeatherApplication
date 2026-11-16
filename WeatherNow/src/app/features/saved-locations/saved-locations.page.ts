/**
 * WeatherNow - Saved Locations Page
 * Allows users to view, switch, and delete bookmarked favorite cities.
 */

import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
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

@Component({
  selector: 'app-saved-locations',
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonAlert,
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

  onSwitchLocation(location: SavedLocation): void {
    const displayName = location.state
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;

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
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.weatherState.setError(err?.message || 'Failed to fetch weather');
          this.router.navigate(['/home']);
        },
      });
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
