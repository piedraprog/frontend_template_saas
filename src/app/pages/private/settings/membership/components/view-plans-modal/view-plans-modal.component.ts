import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PlansService } from '../../../../../../core/services/plans.service';
import { Plan } from '../../../../../../core/models/plan.model';

@Component({
  selector: 'app-view-plans-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './view-plans-modal.component.html',
  styleUrls: ['./view-plans-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPlansModalComponent implements OnChanges {
  private plansService = inject(PlansService);

  /** T6: Listado de planes desde GET /plans, no desde el summary. */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  plans = signal<Plan[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.loadPlans();
    }
  }

  loadPlans(): void {
    this.loading.set(true);
    this.error.set(null);
    this.plansService.getPlans().subscribe({
      next: (list) => {
        const activeOnly = (list ?? []).filter((p) => p.isActive !== false);
        this.plans.set(activeOnly);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error al cargar los planes');
        this.plans.set([]);
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  /** Precio a mostrar (mensual); backend puede enviar price o monthlyPrice */
  planPrice(plan: Plan): number {
    return plan.monthlyPrice ?? plan.price ?? 0;
  }

  planPriceYearly(plan: Plan): number | null {
    const y = plan.annualPrice ?? plan.priceYearly;
    return y != null && y !== 0 ? y : null;
  }
}
