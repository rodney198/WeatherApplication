/**
 * WeatherNow - Main entry point
 * Uses zoneless change detection for better performance.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error('Failed to bootstrap application', err),
);