/**
 * WeatherNow - Reusable UI Components
 * Shared across features for consistent styling, accessibility, and behavior.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [IonIcon, CommonModule],
  template: `
    <div class="weather-icon-badge" [ngClass]="['size-' + size, 'icon-' + icon]">
      <ion-icon [name]="icon"></ion-icon>
    </div>
  `,
  styles: [
    `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .weather-icon-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .size-hero ion-icon {
      font-size: 76px;
    }
    .size-large ion-icon {
      font-size: 52px;
    }
    .size-medium ion-icon {
      font-size: 36px;
    }
    .size-small ion-icon {
      font-size: 24px;
    }

    /* Luminescent weather condition accents */
    .icon-sunny ion-icon {
      color: #fbbf24;
      filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.65));
    }
    .icon-moon ion-icon {
      color: #f1f5f9;
      filter: drop-shadow(0 0 12px rgba(241, 245, 249, 0.5));
    }
    .icon-partly-sunny ion-icon {
      color: #fcd34d;
      filter: drop-shadow(0 0 12px rgba(252, 211, 77, 0.55));
    }
    .icon-cloudy-night ion-icon {
      color: #cbd5e1;
      filter: drop-shadow(0 0 10px rgba(203, 213, 225, 0.45));
    }
    .icon-cloudy ion-icon {
      color: #e2e8f0;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25));
    }
    .icon-rainy ion-icon {
      color: #38bdf8;
      filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.5));
    }
    .icon-thunderstorm ion-icon {
      color: #facc15;
      filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.7));
    }
    .icon-snow ion-icon {
      color: #e0f2fe;
      filter: drop-shadow(0 0 12px rgba(224, 242, 254, 0.65));
    }
    .icon-water ion-icon {
      color: #67e8f9;
      filter: drop-shadow(0 0 10px rgba(103, 232, 249, 0.5));
    }
    `,
  ],
})
export class WeatherIconComponent {
  @Input() icon: string = 'cloudy';
  @Input() size: 'hero' | 'large' | 'medium' | 'small' = 'medium';
}

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [class.active]="loading">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
    .skeleton {
      opacity: 0.6;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.1) 25%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.1) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes skeleton-shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    .skeleton.active {
      animation: skeleton-shimmer 1.5s infinite;
    }
    `,
  ],
})
export class LoadingSkeletonComponent {
  @Input() loading: boolean = true;
}

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (visible) {
      <div class="error-state">
        <ion-icon [name]="icon" class="error-icon"></ion-icon>
        <p class="error-message">{{ message }}</p>
        @if (retryLabel) {
          <button class="retry-btn" (click)="retry.emit()">
            {{ retryLabel }}
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
      color: #fecaca;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 20px;
      backdrop-filter: blur(12px);
      margin: 16px 0;
    }
    .error-icon {
      font-size: 48px;
      margin-bottom: 12px;
      color: #f87171;
    }
    .error-message {
      margin: 0 0 16px 0;
      font-size: 14px;
      line-height: 1.5;
    }
    .retry-btn {
      background: #ffffff;
      color: #dc2626;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .retry-btn:active {
      opacity: 0.8;
    }
    `,
  ],
})
export class ErrorStateComponent {
  @Input() message: string = 'Something went wrong';
  @Input() icon: string = 'alert-circle';
  @Input() retryLabel: string = 'Retry';
  @Input() visible: boolean = true;
  @Output() retry = new EventEmitter<void>();
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (visible) {
      <div class="empty-state">
        <ion-icon [name]="icon" class="empty-icon"></ion-icon>
        <h3 class="empty-title">{{ title }}</h3>
        @if (message) {
          <p class="empty-message">{{ message }}</p>
        }
      </div>
    }
  `,
  styles: [
    `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
    }
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.7;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #ffffff;
    }
    .empty-message {
      font-size: 14px;
      margin: 0;
      opacity: 0.8;
      max-width: 300px;
      line-height: 1.4;
    }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title: string = 'No data available';
  @Input() message: string = '';
  @Input() icon: string = 'cloud-outline';
  @Input() visible: boolean = true;
}
