/**
 * WeatherNow - Root Application Component
 * Provides the app shell with router outlet.
 */

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { SettingsStateService } from './core/services/state/settings-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly settings = inject(SettingsStateService);
  private readonly router = inject(Router);

  readonly temperatureUnit = this.settings.snapshot.temperatureUnit;

  constructor() {}
}