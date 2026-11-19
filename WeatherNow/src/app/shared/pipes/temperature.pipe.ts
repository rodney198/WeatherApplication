/**
 * WeatherNow - Shared Pipes
 * Reusable formatting pipes for temperature, dates, wind, etc.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'temperature',
  standalone: true,
})
export class TemperaturePipe implements PipeTransform {
  transform(value: number | null | undefined, unit: 'metric' | 'imperial' = 'metric'): string {
    if (value === null || value === undefined || isNaN(value)) return '--';
    const rounded = Math.round(value);
    const symbol = unit === 'metric' ? '°C' : '°F';
    return `${rounded}${symbol}`;
  }
}

@Pipe({
  name: 'windDirection',
  standalone: true,
})
export class WindDirectionPipe implements PipeTransform {
  transform(degrees: number | null | undefined): string {
    if (degrees === null || degrees === undefined || isNaN(degrees)) return '--';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return `${directions[index]} ${Math.round(degrees)}°`;
  }
}

@Pipe({
  name: 'dateTime',
  standalone: true,
})
export class DateTimePipe implements PipeTransform {
  transform(
    timestamp: number | null | undefined,
    format: 'short' | 'time' | 'date' | 'day' = 'short',
  ): string {
    if (!timestamp) return '--';
    const date = new Date(timestamp * 1000);
    if (format === 'time') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (format === 'date') return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    if (format === 'day') {
      const now = new Date();
      if (date.toDateString() === now.toDateString()) return 'Today';
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}

@Pipe({
  name: 'pressure',
  standalone: true,
})
export class PressurePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return `${Math.round(value)} hPa`;
  }
}

@Pipe({
  name: 'visibility',
  standalone: true,
})
export class VisibilityPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${value} m`;
  }
}

@Pipe({
  name: 'windSpeed',
  standalone: true,
})
export class WindSpeedPipe implements PipeTransform {
  transform(value: number | null | undefined, unit: 'metric' | 'imperial' = 'metric'): string {
    if (value === null || value === undefined || isNaN(value)) return '--';
    const symbol = unit === 'metric' ? 'm/s' : 'mph';
    return `${Math.round(value)} ${symbol}`;
  }
}
