/**
 * WeatherNow - Shared Pipes Unit Tests
 * Tests for TemperaturePipe, WindDirectionPipe, WindSpeedPipe, DateTimePipe, PressurePipe, VisibilityPipe.
 */

import { describe, it, expect } from 'vitest';
import {
  TemperaturePipe,
  WindDirectionPipe,
  WindSpeedPipe,
  DateTimePipe,
  PressurePipe,
  VisibilityPipe,
} from './temperature.pipe';

describe('Shared Formatting Pipes', () => {
  describe('TemperaturePipe', () => {
    const pipe = new TemperaturePipe();

    it('should format metric temperatures with °C', () => {
      expect(pipe.transform(21.4, 'metric')).toBe('21°C');
      expect(pipe.transform(21.6, 'metric')).toBe('22°C');
      expect(pipe.transform(0, 'metric')).toBe('0°C');
      expect(pipe.transform(-5.2, 'metric')).toBe('-5°C');
    });

    it('should format imperial temperatures with °F', () => {
      expect(pipe.transform(72.4, 'imperial')).toBe('72°F');
      expect(pipe.transform(32, 'imperial')).toBe('32°F');
    });

    it('should return -- for null or undefined or NaN', () => {
      expect(pipe.transform(null)).toBe('--');
      expect(pipe.transform(undefined)).toBe('--');
      expect(pipe.transform(NaN)).toBe('--');
    });
  });

  describe('WindDirectionPipe', () => {
    const pipe = new WindDirectionPipe();

    it('should map compass angles accurately', () => {
      expect(pipe.transform(0)).toBe('N 0°');
      expect(pipe.transform(45)).toBe('NE 45°');
      expect(pipe.transform(90)).toBe('E 90°');
      expect(pipe.transform(180)).toBe('S 180°');
      expect(pipe.transform(270)).toBe('W 270°');
      expect(pipe.transform(360)).toBe('N 360°');
    });

    it('should return -- for invalid values', () => {
      expect(pipe.transform(null)).toBe('--');
      expect(pipe.transform(undefined)).toBe('--');
    });
  });

  describe('WindSpeedPipe', () => {
    const pipe = new WindSpeedPipe();

    it('should format metric wind speed with m/s', () => {
      expect(pipe.transform(5.2, 'metric')).toBe('5 m/s');
    });

    it('should format imperial wind speed with mph', () => {
      expect(pipe.transform(12.4, 'imperial')).toBe('12 mph');
    });

    it('should return -- for invalid values', () => {
      expect(pipe.transform(null)).toBe('--');
    });
  });

  describe('PressurePipe', () => {
    const pipe = new PressurePipe();

    it('should format atmospheric pressure in hPa', () => {
      expect(pipe.transform(1013.25)).toBe('1013 hPa');
    });

    it('should return -- for invalid values', () => {
      expect(pipe.transform(null)).toBe('--');
    });
  });

  describe('VisibilityPipe', () => {
    const pipe = new VisibilityPipe();

    it('should format visibility in km when >= 1000m', () => {
      expect(pipe.transform(10000)).toBe('10.0 km');
      expect(pipe.transform(1500)).toBe('1.5 km');
    });

    it('should format visibility in meters when < 1000m', () => {
      expect(pipe.transform(800)).toBe('800 m');
    });

    it('should return -- for invalid values', () => {
      expect(pipe.transform(null)).toBe('--');
    });
  });

  describe('DateTimePipe', () => {
    const pipe = new DateTimePipe();
    const timestamp = 1700000000; // UNIX seconds timestamp

    it('should format timestamp to time string', () => {
      const result = pipe.transform(timestamp, 'time');
      expect(result).not.toBe('--');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format timestamp to date string', () => {
      const result = pipe.transform(timestamp, 'date');
      expect(result).not.toBe('--');
    });

    it('should return -- for falsy timestamp', () => {
      expect(pipe.transform(0)).toBe('--');
      expect(pipe.transform(null)).toBe('--');
    });
  });
});
