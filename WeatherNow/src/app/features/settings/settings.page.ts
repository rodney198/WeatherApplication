/**
 * WeatherNow - Settings Page
 * Allows users to configure temperature units, view application metadata, and clear saved data.
 */

import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonAlert,
} from '@ionic/angular';

import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { LocationStateService } from '../../core/services/state/location-state.service';
import { TemperatureUnit } from '../../core/models/settings.model';
import { AppStorageService } from '../../core/services/storage.service';
import { AppNavComponent } from '../../shared/components/shared.components';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonAlert,
    AppNavComponent,
  ],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  private readonly settings = inject(SettingsStateService);
  private readonly locationState = inject(LocationStateService);
  private readonly storage = inject(AppStorageService);

  readonly temperatureUnit = toSignal(this.settings.temperatureUnit$, {
    initialValue: this.settings.snapshot.temperatureUnit,
  });

  readonly version = '1.0.0';
  readonly showClearDataAlert = signal(false);

  readonly alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => this.cancelClearData(),
    },
    {
      text: 'Clear Data',
      role: 'destructive',
      handler: () => this.confirmClearData(),
    },
  ];

  onTemperatureUnitChange(event: CustomEvent): void {
    const checked = event.detail.checked;
    const unit: TemperatureUnit = checked ? 'imperial' : 'metric';
    this.settings.setTemperatureUnit(unit);
  }

  onClearData(): void {
    this.showClearDataAlert.set(true);
  }

  async confirmClearData(): Promise<void> {
    await this.storage.clear();
    this.settings.loadSettings({});
    this.locationState.setSavedLocations([]);
    this.showClearDataAlert.set(false);
  }

  cancelClearData(): void {
    this.showClearDataAlert.set(false);
  }
}
