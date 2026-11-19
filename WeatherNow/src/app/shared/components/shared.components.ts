/**
 * WeatherNow - Reusable UI Components
 * Shared across features for consistent styling, accessibility, and behavior.
 * Custom SVG weather illustrations inspired by modern dark dashboard design.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [IonIcon, CommonModule],
  template: `
    <div class="weather-icon-badge" [ngClass]="['size-' + size, 'type-' + icon]">
      @switch (normalizedIcon) {
        @case ('sunny') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <radialGradient id="sunGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fff59d" />
                <stop offset="40%" stop-color="#ffb300" />
                <stop offset="100%" stop-color="#f57c00" />
              </radialGradient>
              <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffca28" />
                <stop offset="100%" stop-color="#ff9800" />
              </linearGradient>
            </defs>
            <!-- 8 Radiating Rays -->
            <g stroke="url(#rayGrad)" stroke-width="4.5" stroke-linecap="round">
              <line x1="32" y1="5" x2="32" y2="11" />
              <line x1="32" y1="53" x2="32" y2="59" />
              <line x1="5" y1="32" x2="11" y2="32" />
              <line x1="53" y1="32" x2="59" y2="32" />
              <line x1="12.9" y1="12.9" x2="17.2" y2="17.2" />
              <line x1="46.8" y1="46.8" x2="51.1" y2="51.1" />
              <line x1="12.9" y1="51.1" x2="17.2" y2="46.8" />
              <line x1="46.8" y1="17.2" x2="51.1" y2="12.9" />
            </g>
            <!-- 3D Sun Sphere -->
            <circle cx="32" cy="32" r="16.5" fill="url(#sunGrad)" />
            <!-- Glossy Highlight -->
            <ellipse cx="26.5" cy="25.5" rx="5" ry="3.5" fill="#ffffff" opacity="0.45" transform="rotate(-25 26.5 25.5)" />
          </svg>
        }
        @case ('partly-sunny') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <radialGradient id="psSun" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fff59d" />
                <stop offset="50%" stop-color="#ffb300" />
                <stop offset="100%" stop-color="#f57c00" />
              </radialGradient>
              <linearGradient id="psCloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#cfd8dc" />
              </linearGradient>
            </defs>
            <!-- Sun -->
            <circle cx="40" cy="23" r="12" fill="url(#psSun)" />
            <g stroke="#ffb300" stroke-width="3" stroke-linecap="round">
              <line x1="40" y1="6" x2="40" y2="9.5" />
              <line x1="52" y1="11" x2="49.5" y2="13.5" />
              <line x1="57" y1="23" x2="53.5" y2="23" />
            </g>
            <!-- Puffy Front Cloud -->
            <path
              d="M20 48h24a10 10 0 0 0 1.5-19.9 14 14 0 0 0-26.8-2A10 10 0 0 0 20 48z"
              fill="url(#psCloud)"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
            />
          </svg>
        }
        @case ('cloudy') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <linearGradient id="cCloud1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#b0bec5" />
              </linearGradient>
              <linearGradient id="cCloud2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#eceff1" />
                <stop offset="100%" stop-color="#90a4ae" />
              </linearGradient>
            </defs>
            <!-- Back Cloud -->
            <path
              d="M28 38h18a8 8 0 0 0 1.2-15.9 11 11 0 0 0-21-1.6A8 8 0 0 0 28 38z"
              fill="url(#cCloud2)"
              opacity="0.8"
            />
            <!-- Main Cloud -->
            <path
              d="M17 50h27a11 11 0 0 0 1.6-21.9 15 15 0 0 0-28.8-2.2A11 11 0 0 0 17 50z"
              fill="url(#cCloud1)"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
            />
          </svg>
        }
        @case ('rainy') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <linearGradient id="rCloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#eceff1" />
                <stop offset="100%" stop-color="#90a4ae" />
              </linearGradient>
            </defs>
            <path
              d="M18 42h26a11 11 0 0 0 1.6-21.9 15 15 0 0 0-28.8-2.2A11 11 0 0 0 18 42z"
              fill="url(#rCloud)"
            />
            <!-- Raindrops -->
            <g stroke="#38bdf8" stroke-width="3" stroke-linecap="round">
              <line x1="22" y1="47" x2="19" y2="55" />
              <line x1="32" y1="47" x2="29" y2="55" />
              <line x1="42" y1="47" x2="39" y2="55" />
            </g>
          </svg>
        }
        @case ('thunderstorm') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <linearGradient id="stCloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#78909c" />
                <stop offset="100%" stop-color="#37474f" />
              </linearGradient>
            </defs>
            <path
              d="M18 38h26a11 11 0 0 0 1.6-21.9 15 15 0 0 0-28.8-2.2A11 11 0 0 0 18 38z"
              fill="url(#stCloud)"
            />
            <!-- Golden Lightning Bolt -->
            <polygon
              points="32,34 23,48 31,48 27,60 41,44 33,44"
              fill="#ffca28"
              stroke="#ffb300"
              stroke-width="1.2"
            />
          </svg>
        }
        @case ('snow') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <linearGradient id="snCloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#b0bec5" />
              </linearGradient>
            </defs>
            <path
              d="M18 42h26a11 11 0 0 0 1.6-21.9 15 15 0 0 0-28.8-2.2A11 11 0 0 0 18 42z"
              fill="url(#snCloud)"
            />
            <g fill="#e0f2fe">
              <circle cx="22" cy="50" r="2.5" />
              <circle cx="32" cy="54" r="2.5" />
              <circle cx="42" cy="50" r="2.5" />
            </g>
          </svg>
        }
        @case ('moon') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <defs>
              <linearGradient id="mGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#cbd5e1" />
              </linearGradient>
            </defs>
            <path d="M38 14a18 18 0 1 0 12 28 16 16 0 0 1-12-28z" fill="url(#mGrad)" />
            <circle cx="20" cy="18" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="48" cy="16" r="1.2" fill="#ffffff" opacity="0.7" />
            <circle cx="15" cy="38" r="1" fill="#ffffff" opacity="0.6" />
          </svg>
        }
        @case ('water') {
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="weather-svg">
            <g stroke="#7dd3fc" stroke-width="3.5" stroke-linecap="round">
              <path d="M14 26h28a6 6 0 0 0 6-6" />
              <path d="M10 34h36a6 6 0 0 1 6 6" />
              <path d="M18 42h20a5 5 0 0 0 5-5" />
            </g>
          </svg>
        }
        @default {
          <ion-icon [name]="icon"></ion-icon>
        }
      }
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
    .weather-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .size-hero {
      width: 110px;
      height: 110px;
    }
    .size-hero ion-icon {
      font-size: 80px;
    }

    .size-large {
      width: 68px;
      height: 68px;
    }
    .size-large ion-icon {
      font-size: 52px;
    }

    .size-medium {
      width: 44px;
      height: 44px;
    }
    .size-medium ion-icon {
      font-size: 34px;
    }

    .size-small {
      width: 30px;
      height: 30px;
    }
    .size-small ion-icon {
      font-size: 24px;
    }

    .type-sunny {
      filter: drop-shadow(0 0 14px rgba(255, 179, 0, 0.45));
    }
    .type-thunderstorm {
      filter: drop-shadow(0 0 14px rgba(255, 202, 40, 0.5));
    }
    .type-rainy {
      filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.4));
    }
    `,
  ],
})
export class WeatherIconComponent {
  @Input() icon: string = 'cloudy';
  @Input() size: 'hero' | 'large' | 'medium' | 'small' = 'medium';

  get normalizedIcon(): string {
    const val = (this.icon || 'cloudy').toLowerCase();
    if (val.includes('sun') && val.includes('partly')) return 'partly-sunny';
    if (val.includes('sun') || val === '01d') return 'sunny';
    if (val.includes('storm') || val.includes('thunder') || val.includes('11')) return 'thunderstorm';
    if (val.includes('rain') || val.includes('09') || val.includes('10')) return 'rainy';
    if (val.includes('snow') || val.includes('13')) return 'snow';
    if (val.includes('moon') || val === '01n') return 'moon';
    if (val.includes('mist') || val.includes('water') || val.includes('50')) return 'water';
    if (val.includes('cloud')) return 'cloudy';
    return val;
  }
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, IonIcon],
  template: `
    <!-- Desktop Left Sidebar Rail -->
    <aside class="desktop-sidebar">
      <div class="sidebar-top">
        <div class="logo-box" routerLink="/home" aria-label="WeatherNow home">
          <ion-icon name="cloudy" class="logo-icon"></ion-icon>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/home" class="nav-btn" [class.active]="activeTab === 'weather'" aria-label="Weather">
          <ion-icon name="rainy-outline" class="nav-icon"></ion-icon>
          <span class="nav-label">Weather</span>
        </a>
        <a routerLink="/search" class="nav-btn" [class.active]="activeTab === 'cities'" aria-label="Cities">
          <ion-icon name="search-outline" class="nav-icon"></ion-icon>
          <span class="nav-label">Cities</span>
        </a>
        <a routerLink="/saved-locations" class="nav-btn" [class.active]="activeTab === 'saved'" aria-label="Saved">
          <ion-icon name="bookmark-outline" class="nav-icon"></ion-icon>
          <span class="nav-label">Saved</span>
        </a>
        <a routerLink="/settings" class="nav-btn" [class.active]="activeTab === 'settings'" aria-label="Settings">
          <ion-icon name="settings-outline" class="nav-icon"></ion-icon>
          <span class="nav-label">Settings</span>
        </a>
      </nav>
    </aside>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav">
      <a routerLink="/home" class="bottom-tab" [class.active]="activeTab === 'weather'">
        <ion-icon name="rainy-outline"></ion-icon>
        <span>Weather</span>
      </a>
      <a routerLink="/search" class="bottom-tab" [class.active]="activeTab === 'cities'">
        <ion-icon name="search-outline"></ion-icon>
        <span>Cities</span>
      </a>
      <a routerLink="/saved-locations" class="bottom-tab" [class.active]="activeTab === 'saved'">
        <ion-icon name="bookmark-outline"></ion-icon>
        <span>Saved</span>
      </a>
      <a routerLink="/settings" class="bottom-tab" [class.active]="activeTab === 'settings'">
        <ion-icon name="settings-outline"></ion-icon>
        <span>Settings</span>
      </a>
    </nav>
  `,
  styles: [
    `
    /* Desktop Sidebar (min-width: 992px) */
    .desktop-sidebar {
      display: none;
      width: 92px;
      flex-shrink: 0;
      background: #202b3b;
      border-radius: 24px;
      padding: 24px 10px;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }

    .logo-box {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #2a374a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .logo-box:hover {
      transform: scale(1.05);
    }
    .logo-icon {
      font-size: 26px;
      color: #0095ff;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;
      align-items: center;
    }

    .nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: #939eaf;
      padding: 8px 6px;
      border-radius: 12px;
      width: 72px;
      transition: color 0.2s, background 0.2s;
    }
    .nav-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-btn.active {
      color: #ffffff;
    }
    .nav-btn.active .nav-icon {
      color: #0095ff;
    }
    .nav-icon {
      font-size: 24px;
    }
    .nav-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    /* Mobile Bottom Navigation (max-width: 991px) */
    .mobile-bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #202b3b;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      z-index: 1000;
      justify-content: space-around;
      align-items: center;
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }

    .bottom-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      text-decoration: none;
      color: #939eaf;
      font-size: 11px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .bottom-tab ion-icon {
      font-size: 22px;
    }
    .bottom-tab.active {
      color: #0095ff;
    }

    @media (min-width: 992px) {
      .desktop-sidebar {
        display: flex;
      }
      .mobile-bottom-nav {
        display: none;
      }
    }
    `,
  ],
})
export class AppNavComponent {
  @Input() activeTab: 'weather' | 'cities' | 'saved' | 'settings' = 'weather';
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
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.12) 50%,
        rgba(255, 255, 255, 0.05) 75%
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
      color: #fca5a5;
      background: #202b3b;
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 20px;
      margin: 16px 0;
    }
    .error-icon {
      font-size: 44px;
      margin-bottom: 12px;
      color: #f87171;
    }
    .error-message {
      margin: 0 0 16px 0;
      font-size: 14px;
      line-height: 1.5;
    }
    .retry-btn {
      background: #0095ff;
      color: #ffffff;
      border: none;
      padding: 8px 22px;
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
      color: #939eaf;
    }
    .empty-icon {
      font-size: 56px;
      margin-bottom: 16px;
      opacity: 0.5;
      color: #0095ff;
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
