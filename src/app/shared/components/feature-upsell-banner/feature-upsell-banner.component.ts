import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { Router } from '@angular/router';

export interface UpsellBannerData {
  featureSlug: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  dismissible?: boolean;
  variant?: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-feature-upsell-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    @if (!isDismissed()) {
      <div
        class="upsell-banner flex items-center justify-between p-3 rounded-md gap-3"
        [class]="getBannerClass()"
      >
        <div class="flex items-start gap-3 flex-1">
          <!-- Icon -->
          <i [class]="getIconClass()" class="text-2xl mt-1"></i>

          <!-- Content -->
          <div class="flex-1">
            <h4 class="m-0 mb-1 font-semibold">{{ data().title }}</h4>
            <p class="m-0 text-sm">{{ data().description }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          @if (data().ctaText) {
            <p-button
              [label]="data()!.ctaText"
              size="small"
              [severity]="getButtonSeverity()"
              (onClick)="handleCta()"
            />
          }

          @if (data().dismissible !== false) {
            <button
              class="dismiss-btn p-button-text p-button-rounded p-button-sm"
              (click)="dismiss()"
              title="Cerrar"
            >
              <i class="pi pi-times"></i>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .upsell-banner {
        border: 1px solid;
        transition: all 0.3s ease;
      }

      .upsell-banner.info {
        background-color: #eff6ff;
        border-color: #3b82f6;
        color: #1e40af;
      }

      .upsell-banner.warning {
        background-color: #fef3c7;
        border-color: #f59e0b;
        color: #92400e;
      }

      .upsell-banner.success {
        background-color: #ecfdf5;
        border-color: #10b981;
        color: #065f46;
      }

      .dismiss-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .dismiss-btn:hover {
        opacity: 1;
      }

      @media (max-width: 768px) {
        .upsell-banner {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureUpsellBannerComponent implements OnInit {
  private router = inject(Router);

  data = input.required<UpsellBannerData>();
  isDismissed = signal(false);

  ngOnInit() {
    // Check if this banner was previously dismissed
    if (this.data().dismissible !== false) {
      const dismissKey = `banner_dismissed_${this.data().featureSlug}`;
      const wasDismissed = localStorage.getItem(dismissKey);
      if (wasDismissed) {
        this.isDismissed.set(true);
      }
    }
  }

  getBannerClass(): string {
    const variant = this.data().variant || 'info';
    return variant;
  }

  getIconClass(): string {
    const variant = this.data().variant || 'info';
    switch (variant) {
      case 'info':
        return 'pi pi-info-circle text-blue-500';
      case 'warning':
        return 'pi pi-exclamation-triangle text-orange-500';
      case 'success':
        return 'pi pi-star text-green-500';
      default:
        return 'pi pi-info-circle text-blue-500';
    }
  }

  getButtonSeverity(): ButtonSeverity {
    const variant = this.data().variant || 'info';
    switch (variant) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warn';
      default:
        return 'info';
    }
  }

  handleCta() {
    const ctaLink = this.data().ctaLink;
    if (ctaLink) {
      if (ctaLink.startsWith('http')) {
        // External link
        window.open(ctaLink, '_blank');
      } else {
        // Internal route
        this.router.navigate([ctaLink], {
          queryParams: { feature: this.data().featureSlug },
        });
      }
    } else {
      // Default to plans page
      this.router.navigate(['/plans'], {
        queryParams: { feature: this.data().featureSlug },
      });
    }
  }

  dismiss() {
    this.isDismissed.set(true);

    // Save dismissal to localStorage
    const dismissKey = `banner_dismissed_${this.data().featureSlug}`;
    localStorage.setItem(dismissKey, 'true');
  }
}
