/**
 * WeatherNow - Shared Components Unit Tests
 * Tests for WeatherIconComponent, ErrorStateComponent, EmptyStateComponent.
 */

import { describe, it, expect, vi } from 'vitest';

import {
  WeatherIconComponent,
  ErrorStateComponent,
  EmptyStateComponent,
} from './shared.components';

describe('Shared Components', () => {
  describe('WeatherIconComponent', () => {
    it('should create and have default inputs', () => {
      const component = new WeatherIconComponent();
      expect(component).toBeTruthy();
      expect(component.icon).toBe('cloudy');
      expect(component.size).toBe('medium');
    });

    it('should accept custom icon and size properties', () => {
      const component = new WeatherIconComponent();
      component.icon = 'sunny';
      component.size = 'large';

      expect(component.icon).toBe('sunny');
      expect(component.size).toBe('large');
    });
  });

  describe('ErrorStateComponent', () => {
    it('should create with default message and visibility', () => {
      const component = new ErrorStateComponent();
      expect(component).toBeTruthy();
      expect(component.message).toBe('Something went wrong');
      expect(component.visible).toBe(true);
    });

    it('should emit retry event when requested', () => {
      const component = new ErrorStateComponent();
      const emitSpy = vi.spyOn(component.retry, 'emit');

      component.retry.emit();
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('EmptyStateComponent', () => {
    it('should create with default inputs and visibility', () => {
      const component = new EmptyStateComponent();
      expect(component).toBeTruthy();
      expect(component.title).toBe('No data available');
      expect(component.icon).toBe('cloud-outline');
      expect(component.visible).toBe(true);
    });

    it('should accept custom title and message', () => {
      const component = new EmptyStateComponent();
      component.title = 'Custom Title';
      component.message = 'Custom Message';

      expect(component.title).toBe('Custom Title');
      expect(component.message).toBe('Custom Message');
    });
  });
});
