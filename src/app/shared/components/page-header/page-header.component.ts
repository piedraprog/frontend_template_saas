import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="page-header">
      <div class="header-left">
        @if (showBack()) {
          <button
            type="button"
            class="back-button"
            (click)="onBackClick($event)"
            (touchend)="onBackClick($event)"
            (keydown.enter)="onBackClick($event)"
            (keydown.space)="onBackClick($event)"
            aria-label="Volver"
            tabindex="0"
          >
            <i class="pi pi-arrow-left"></i>
          </button>
        }
        <div class="header-title-wrapper">
          @if (icon()) {
            <i [class]="icon()" class="header-icon"></i>
          }
          <h1 class="header-title">{{ title() }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #ffffff;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      border-radius: 10px;
      border: none;
      background: #f3f4f6;
      cursor: pointer;
      transition: all 0.2s ease;
      touch-action: manipulation;
      user-select: none;
      i {
        font-size: 1.125rem;
        color: #4b5563;
        pointer-events: none;
      }
      &:hover {
        background: #e5e7eb;
        i {
          color: #1f2937;
        }
      }
      &:active,
      &:focus {
        transform: scale(0.95);
        background: #d1d5db;
        outline: none;
      }
      &:focus-visible {
        outline: 2px solid var(--p-primary-500);
        outline-offset: 2px;
      }
    }
    .header-title-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .header-icon {
      font-size: 1.5rem;
      color: var(--p-primary-500);
    }
    .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    @media (max-width: 639px) {
      .page-header {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .header-title {
        font-size: 1.25rem;
      }
      .header-left {
        gap: 0.5rem;
      }
      .back-button {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        &:active {
          transform: scale(0.92);
          background: #d1d5db;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  private location = inject(Location);
  private router = inject(Router);

  title = input.required<string>();
  icon = input<string>('');
  showBack = input<boolean>(true);
  backRoute = input<string>('');
  back = output<void>();

  private lastClickTime = 0;
  private readonly CLICK_DELAY = 300;
  private touchHandled = false;

  onBackClick(event: Event): void {
    if (event.type === 'touchend') {
      event.preventDefault();
      event.stopPropagation();
      this.touchHandled = true;
      setTimeout(() => {
        this.touchHandled = false;
      }, this.CLICK_DELAY);
    }
    if (event.type === 'click' && this.touchHandled) return;
    const now = Date.now();
    if (now - this.lastClickTime < this.CLICK_DELAY) return;
    this.lastClickTime = now;
    this.back.emit();
    if (this.backRoute()) {
      this.router.navigate([this.backRoute()]);
    } else {
      this.location.back();
    }
  }
}
