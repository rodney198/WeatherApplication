/**
 * WeatherNow - Reusable UI Components
 * Shared across features for consistent styling and behavior.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [IonIcon],
  template: `
    <ion-icon
      [name]="icon"
      [class.large]="size === 'large'"
      [class.medium]="size === 'medium'"
      [class.small]="size === 'small'"
    ></ion-icon>
  `,
  styles: [
    `
    .large { font-size: 64px; }
    .medium { font-size: 40px; }
    .small { font-size: 24px; }
    `,
  ],
})
export class WeatherIconComponent {
  @Input() icon: string = 'cloudy';
  @Input() size: 'large' | 'medium' | 'small' = 'medium';
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
      background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton.active { animation: skeleton-shimmer 1.5s infinite; }
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
    <div class="error-state" *ngIf="visible">
      <ion-icon [name]="icon" class="error-icon"></ion-icon>
      <p class="error-message">{{ message }}</p>
      <button class="retry-btn" *ngIf="retryLabel" (click)="retry.emit()">
        {{ retryLabel }}
      </button>
    </div>
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
      color: var(--ion-color-danger, #ff3b30);
    }
    .error-icon { font-size: 48px; margin-bottom: 12px; }
    .error-message { margin: 0 0 16px 0; font-size: 14px; }
    .retry-btn {
      background: var(--ion-color-primary, #3880ff);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    }
    `,
  ],
})
export class ErrorStateComponent {
  @Input() message: string = 'Something went wrong';
  @Input() icon: string = 'alert-circle';
  @Input() retryLabel: string | null = null;
  @Input() visible: boolean = false;

  @Output() retry = new EventEmitter<void>();
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="empty-state" *ngIf="visible">
      <ion-icon [name]="icon" class="empty-icon"></ion-icon>
      <p class="empty-title">{{ title }}</p>
      <p class="empty-message" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
      color: var(--ion-color-medium, #92949c);
    }
    .empty-icon { font-size: 56px; margin-bottom: 12px; opacity: 0.5; }
    .empty-title { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; }
    .empty-message { margin: 0; font-size: 14px; }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title: string = 'No data available';
  @Input() message: string = '';
  @Input() icon: string = 'cloud-outline';
  @Input() visible: boolean = false;
}