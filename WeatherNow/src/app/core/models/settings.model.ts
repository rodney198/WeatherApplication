/**
 * WeatherNow - Settings type definitions
 */

export type TemperatureUnit = 'metric' | 'imperial';

export interface SettingsState {
  temperatureUnit: TemperatureUnit;
  defaultLocationId: string | null;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  temperatureUnit: 'metric',
  defaultLocationId: null,
  hasCompletedOnboarding: false,
};