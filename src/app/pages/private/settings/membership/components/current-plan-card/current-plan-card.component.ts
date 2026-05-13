import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SubscriptionUsage,
  PlanSummary,
  SubscriptionStatus,
} from '../../../../../../core/models/interfaces/subscription.interface';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-current-plan-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './current-plan-card.component.html',
  styleUrls: ['./current-plan-card.component.scss'],
})
export class CurrentPlanCardComponent {
  plan = input<PlanSummary | null>(null);
  subscription = input<SubscriptionStatus | null>(null);
  usage = input<SubscriptionUsage | null>(null);
  @Output() upgradePlan = new EventEmitter<void>();

  handleUpgrade() {
    this.upgradePlan.emit();
  }

  formatFeature(slug: string): string {
    // Convierte slugs como 'advanced_analytics' a 'Analíticas Avanzadas'
    return slug
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
