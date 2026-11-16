/**
 * WeatherNow - Saved Locations Page
 * Allows users to manage saved/favorite cities.
 */

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonList, IonItem, IonIcon, IonLabel, IonButton, IonAlert } from '@ionic/angular';

import { LocationStateService } from '../../core/services/state/location-state.service';
import { AppStorageService } from '../../core/services/storage.service';
import { SavedLocation } from '../../core/models/location.model';

@Component({
  selector: 'app-saved-locations',
  standalone: true,
  imports: [
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
  private readonly storage = inject(AppStorageService);
  private readonly router = inject(Router);

  readonly savedLocations = this.locationState.savedLocations$;
  readonly currentLocationId = this.locationState.snapshot.savedLocations.find((l) => l.isCurrent)?.id || null;

  showDeleteAlert = false;
  deletingLocationId: string | null = null;

  constructor() {}

  onSwitchLocation(location: SavedLocation): void {
    this.locationState.setCurrent({ latitude: location.lat, longitude: location.lon }, location.name);
    this.locationState.setCurrentLocationId(location.id);
    this.router.navigate(['/home']);
  }

  onDeleteLocation(location: SavedLocation): void {
    this.deletingLocationId = location.id;
    this.showDeleteAlert = true;
  }

  confirmDelete(): void {
    if (this.deletingLocationId) {
      this.locationState.removeSavedLocation(this.deletingLocationId);
    }
    this.showDeleteAlert = false;
    this.deletingLocationId = null;
  }

  cancelDelete(): void {
    this.showDeleteAlert = false;
    this.deletingLocationId = null;
  }
}