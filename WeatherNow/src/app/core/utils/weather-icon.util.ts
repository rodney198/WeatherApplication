/**
 * WeatherNow - Weather Icon Utility
 * Maps OpenWeatherMap icon codes to Ionicons for consistent UI.
 */

import { environment } from '../../../environments/environment';

export interface IconMap {
  [key: string]: string;
}

export const WEATHER_ICONS: IconMap = {
  '01d': 'sunny',
  '01n': 'moon',
  '02d': 'partly-sunny',
  '02n': 'partly-cloudy-night',
  '03d': 'cloudy',
  '03n': 'cloudy',
  '04d': 'cloudy',
  '04n': 'cloudy',
  '09d': 'rainy',
  '09n': 'rainy',
  '10d': 'rainy',
  '10n': 'rainy',
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'mist',
  '50n': 'mist',
};

export function getWeatherIcon(iconCode: string): string {
  return WEATHER_ICONS[iconCode] || 'cloudy';
}

export function getWeatherDescription(description: string): string {
  return description
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}