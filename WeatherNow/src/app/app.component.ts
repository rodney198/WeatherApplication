/**
 * WeatherNow - Root Application Component
 * Provides the app shell and initializes native Capacitor plugins on startup.
 */

import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { NativeService } from './core/services/native.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly nativeService = inject(NativeService);

  async ngOnInit(): Promise<void> {
    await this.nativeService.initializeStatusBar();
    await this.nativeService.hideSplashScreen();
  }
}
