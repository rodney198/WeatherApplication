/**
 * WeatherNow - Location type definitions
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  isCurrent: boolean;
  addedAt: number;
}

export interface LocationState {
  current: Coordinates | null;
  currentLocationName: string | null;
  savedLocations: SavedLocation[];
  loading: boolean;
  error: string | null;
}

export const EMPTY_LOCATION_STATE: LocationState = {
  current: null,
  currentLocationName: null,
  savedLocations: [],
  loading: false,
  error: null,
};