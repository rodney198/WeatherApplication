/**
 * WeatherNow - Location Service
 * Wraps Capacitor Geolocation plugin with proper permission handling.
 * Provides current coordinates and reverse geocoding.
 */

import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Observable, from, of, throwError, timer } from 'rxjs';
import { map, timeout, retry,catchError, switchMap } from 'rxjs/operators';

import { Coordinates } from '../models/location.model';

export interface LocationResult {
  coordinates: Coordinates;
  accuracy: number;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

const LOCATION_TIMEOUT_MS = 15000;
const MAX_RETRY_ATTEMPTS = 2;

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private cachedPosition: Coordinates | null = null;

  /**
   * Request location permission.
   */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted' || permission.coarseLocation === 'granted';
    } catch (error) {
      console.error('[Location] Permission request failed', error);
      return false;
    }
  }

  /**
   * Check if location permission is granted.
   */
  async checkPermission(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted' || permission.coarseLocation === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Get current device position with timeout and retry.
   */
  getCurrentPosition(): Observable<LocationResult> {
    return from(
      Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: LOCATION_TIMEOUT_MS,
        maximumAge: 60000, // Accept position up to 1 minute old
      }),
    ).pipe(
      timeout(LOCATION_TIMEOUT_MS + 5000),
      retry(MAX_RETRY_ATTEMPTS),
      map((position: Position) => ({
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        accuracy: position.coords.accuracy,
      })),
      catchError((error) => {
        const locationError = this.mapError(error);
        return throwError(() => locationError);
      }),
    );
  }

  /**
   * Get current position synchronously (best effort, no retry).
   */
  async getCurrentPositionAsync(): Promise<LocationResult> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: LOCATION_TIMEOUT_MS,
        maximumAge: 60000,
      });
      return {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        accuracy: position.coords.accuracy,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  /**
   * Cache current position to avoid repeated GPS requests.
   */
  cachePosition(coords: Coordinates): void {
    this.cachedPosition = coords;
  }

  /**
   * Get cached position if available.
   */
  getCachedPosition(): Coordinates | null {
    return this.cachedPosition;
  }

  /**
   * Clear cached position.
   */
  clearCache(): void {
    this.cachedPosition = null;
  }

  /**
   * Map native errors to application error codes.
   */
  private mapError(error: unknown): LocationError {
    const message = (error as Error)?.message || String(error);

    if (message.includes('permission') || message.includes('Permission')) {
      return { code: 'PERMISSION_DENIED', message: 'Location permission denied' };
    }
    if (message.includes('timeout') || message.includes('Timeout')) {
      return { code: 'TIMEOUT', message: 'Location request timed out' };
    }
    if (message.includes('unavailable') || message.includes('not available')) {
      return { code: 'POSITION_UNAVAILABLE', message: 'Location unavailable' };
    }
    return { code: 'UNKNOWN', message: 'Unable to retrieve location' };
  }
}