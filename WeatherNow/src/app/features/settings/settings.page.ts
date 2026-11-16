/**
 * WeatherNow - Settings Page
 * Allows users to configure temperature units and preferences.
 */

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonList, IonItem, IonLabel, IonToggle, IonIcon, IonAlert } from '@ionic/angular';

import { SettingsStateService } from '../../core/services/state/settings-state.service';
import { TemperatureUnit } from '../../core/models/settings.model';
import { AppStorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
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
    IonLabel,
    IonToggle,
    IonIcon,
    IonAlert,
  ],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  private readonly settings = inject(SettingsStateService);
  private readonly storage = inject(AppStorageService);
  private readonly router = inject(Router);

  readonly temperatureUnit = this.settings.snapshot.temperatureUnit;
  readonly version = '1.0.0';

  showClearDataAlert = false;

  constructor() {}

  onTemperatureUnitChange(event: CustomEvent): void {
    const checked = event.detail.checked;
    const unit: TemperatureUnit = checked ? 'imperial' : 'metric';
    this.settings.setTemperatureUnit(unit);
  }

  onClearData(): void {
    this.showClearDataAlert = true;
  }

  async confirmClearData(): Promise<void> {
    await this.storage.clear();
    this.showClearDataAlert = false;
  }

  cancelClearData(): void {
    this.showClearDataAlert = false;
  }
}