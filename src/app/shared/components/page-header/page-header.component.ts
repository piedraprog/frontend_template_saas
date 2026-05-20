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
          <div class="header-copy">
            <h1 class="header-title">{{ title() }}</h1>
            @if (subtitle()) {
              <p class="header-subtitle">{{ subtitle() }}</p>
            }
          </div>
        </div>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
      background: linear-gradient(180deg, rgb(255 255 255 / 0.97) 0%, rgb(248 250 252 / 0.98) 100%);
      border: 1px solid rgb(226 232 240 / 0.95);
      border-radius: 0.5rem;
      box-shadow:
        0 1px 2px rgb(15 23 42 / 0.06),
        0 8px 24px rgb(15 23 42 / 0.06);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
      flex: 1 1 16rem;
    }
    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      min-width: 2.75rem;
      min-height: 2.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgb(226 232 240 / 0.95);
      background: rgb(248 250 252 / 0.95);
      cursor: pointer;
      transition:
        background 0.18s ease,
        border-color 0.18s ease,
        transform 0.12s ease;
      touch-action: manipulation;
      user-select: none;
      flex-shrink: 0;
      i {
        font-size: 1rem;
        color: #475569;
        pointer-events: none;
      }
      &:hover {
        background: #fff;
        border-color: rgb(var(--p-primary-300, 147 197 253) / 0.85);
        i {
          color: #0f172a;
        }
      }
      &:active {
        transform: scale(0.96);
      }
      &:focus-visible {
        outline: 2px solid var(--p-primary-500);
        outline-offset: 2px;
      }
    }
    .header-title-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      min-width: 0;
    }
    .header-icon {
      font-size: 1.375rem;
      color: var(--p-primary-600, #2563eb);
      flex-shrink: 0;
      margin-top: 0.125rem;
    }
    .header-copy {
      min-width: 0;
    }
    .header-title {
      font-size: clamp(1.2rem, 2vw, 1.45rem);
      font-weight: 800;
      letter-spacing: 0;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
      overflow-wrap: anywhere;
    }
    .header-subtitle {
      max-width: 48rem;
      margin: 0.3rem 0 0;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.45;
    }
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      flex: 1 1 auto;
      min-width: 0;
    }
    @media (max-width: 1080px) {
      .page-header {
        padding: 0.875rem 1rem;
      }
      .header-left {
        flex: 1 1 100%;
      }
      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
    @media (max-width: 639px) {
      .page-header {
        margin-bottom: 1rem;
      }
      .header-actions {
        justify-content: stretch;
      }
      .header-actions ::ng-deep .p-button {
        flex: 1 1 auto;
      }
      .back-button {
        width: 2.875rem;
        height: 2.875rem;
        min-width: 2.875rem;
        min-height: 2.875rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  private location = inject(Location);
  private router = inject(Router);

  title = input.required<string>();
  subtitle = input<string>('');
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
