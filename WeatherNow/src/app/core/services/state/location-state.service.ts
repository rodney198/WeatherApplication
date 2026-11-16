/**
 * WeatherNow - Location State Service
 * Reactive state for current coordinates and saved locations.
 * Persists bookmarked locations to Capacitor Preferences via AppStorageService.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import {
  Coordinates,
  LocationState,
  SavedLocation,
  EMPTY_LOCATION_STATE,
} from '../../models/location.model';
import { AppStorageService } from '../storage.service';

const SAVED_LOCATIONS_STORAGE_KEY = 'weathernow_saved_locations';

@Injectable({
  providedIn: 'root',
})
export class LocationStateService {
  private readonly storage = inject(AppStorageService);
  private readonly state$ = new BehaviorSubject<LocationState>(EMPTY_LOCATION_STATE);

  readonly location$ = this.state$.asObservable();
  readonly current$ = this.state$.pipe(map((s) => s.current));
  readonly savedLocations$ = this.state$.pipe(map((s) => s.savedLocations));
  readonly loading$ = this.state$.pipe(map((s) => s.loading));
  readonly error$ = this.state$.pipe(map((s) => s.error));
  readonly currentLocationName$ = this.state$.pipe(map((s) => s.currentLocationName));

  get snapshot(): LocationState {
    return this.state$.value;
  }

  constructor() {
    this.loadPersistedLocations();
  }

  private async loadPersistedLocations(): Promise<void> {
    try {
      const persisted = await this.storage.get<SavedLocation[]>(SAVED_LOCATIONS_STORAGE_KEY);
      if (persisted && Array.isArray(persisted)) {
        this.update({ savedLocations: persisted });
      }
    } catch (e) {
      console.warn('[LocationState] Failed to load persisted locations', e);
    }
  }

  private async persistLocations(): Promise<void> {
    try {
      await this.storage.set(SAVED_LOCATIONS_STORAGE_KEY, this.snapshot.savedLocations);
    } catch (e) {
      console.warn('[LocationState] Failed to persist locations', e);
    }
  }

  /**
   * Set current device coordinates and location name.
   */
  setCurrent(coords: Coordinates | null, name: string | null = null): void {
    this.update({ current: coords, currentLocationName: name, error: null });
  }

  /**
   * Set loading state.
   */
  setLoading(loading: boolean): void {
    this.update({ loading });
  }

  /**
   * Set error state.
   */
  setError(error: string | null): void {
    this.update({ error, loading: false });
  }

  /**
   * Add a saved location (prevents duplicates by lat/lon coordinates).
   */
  addSavedLocation(location: Omit<SavedLocation, 'id' | 'addedAt'>): SavedLocation | null {
    const exists = this.snapshot.savedLocations.some(
      (l) => Math.abs(l.lat - location.lat) < 0.001 && Math.abs(l.lon - location.lon) < 0.001,
    );
    if (exists) return null;

    const newLocation: SavedLocation = {
      isCurrent: false,
      ...location,
      id: this.generateId(),
      addedAt: Date.now(),
    };

    this.update({ savedLocations: [...this.snapshot.savedLocations, newLocation] });
    this.persistLocations();
    return newLocation;
  }

  /**
   * Remove a saved location by id.
   */
  removeSavedLocation(id: string): void {
    this.update({
      savedLocations: this.snapshot.savedLocations.filter((l) => l.id !== id),
    });
    this.persistLocations();
  }

  /**
   * Set saved locations (e.g. from storage).
   */
  setSavedLocations(locations: SavedLocation[]): void {
    this.update({ savedLocations: locations });
    this.persistLocations();
  }

  /**
   * Mark a saved location as the active/current location.
   */
  setCurrentLocationId(id: string): void {
    this.update({
      savedLocations: this.snapshot.savedLocations.map((l) => ({
        ...l,
        isCurrent: l.id === id,
      })),
    });
    this.persistLocations();
  }

  /**
   * Get a saved location by id.
   */
  getSavedLocation(id: string): SavedLocation | undefined {
    return this.snapshot.savedLocations.find((l) => l.id === id);
  }

  private update(partial: Partial<LocationState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  private generateId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
