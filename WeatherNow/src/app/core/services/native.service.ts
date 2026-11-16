/**
 * WeatherNow - Native Integration Service
 * Handles Capacitor native plugin integration: Status Bar, Splash Screen, App Lifecycle.
 * Provides platform-specific configuration and permission handling.
 */

import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export interface NativeCapabilities {
  geolocation: boolean;
  preferences: boolean;
  statusBar: boolean;
  splashScreen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NativeService {
  private readonly platform = inject(Platform);
  private readonly isNative = this.platform.is('capacitor') || this.platform.is('cordova');

  /**
   * Check if running on a native device platform (iOS/Android).
   */
  get isNativePlatform(): boolean {
    return this.isNative;
  }

  /**
   * Initialize status bar styling for the current platform.
   */
  async initializeStatusBar(): Promise<void> {
    if (!this.isNative) return;

    try {
      const style = this.platform.is('ios') ? Style.Dark : Style.Light;
      await StatusBar.setStyle({ style });
      if (this.platform.is('android')) {
        await StatusBar.setBackgroundColor({ color: '#667eea' });
      }
      await StatusBar.show();
    } catch (error) {
      console.warn('[Native] Failed to initialize status bar', error);
    }
  }

  /**
   * Hide the splash screen smoothly after app initialization.
   */
  async hideSplashScreen(): Promise<void> {
    if (!this.isNative) return;

    try {
      await SplashScreen.hide({
        fadeOutDuration: 400,
      });
    } catch (error) {
      console.warn('[Native] Failed to hide splash screen', error);
    }
  }

  /**
   * Listen for app state changes (foreground/background).
   */
  onAppStateChange(callback: (state: 'active' | 'background') => void): () => void {
    if (!this.isNative) return () => {};

    const handler = App.addListener('appStateChange', (state: { isActive: boolean }) => {
      callback(state.isActive ? 'active' : 'background');
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }
}
