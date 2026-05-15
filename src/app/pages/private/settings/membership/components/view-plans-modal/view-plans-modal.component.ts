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
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { PlansService } from '../../../../../../core/services/plans.service';
import { Plan } from '../../../../../../core/models/plan.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-plans-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, ProgressSpinnerModule, ToastModule],
  templateUrl: './view-plans-modal.component.html',
  styleUrls: ['./view-plans-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPlansModalComponent implements OnChanges {
  private plansService = inject(PlansService);
  private messageService = inject(MessageService);

  /** T6: Listado de planes desde GET /plans, no desde el summary. */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  plans = signal<Plan[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  checkoutPlanId = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.loadPlans();
    }
  }

  loadPlans(): void {
    this.loading.set(true);
    this.error.set(null);
    this.plansService
      .getPlans()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          const activeOnly = (list ?? []).filter((p) => p.isActive !== false);
          this.plans.set(activeOnly);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Error al cargar los planes');
          this.plans.set([]);
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

  subscribeToPlan(plan: Plan): void {
    this.checkoutPlanId.set(plan.id);
    this.plansService
      .createSubscriptionCheckout(plan.id, 'stripe')
      .pipe(finalize(() => this.checkoutPlanId.set(null)))
      .subscribe({
        next: (session) => {
          if (!session.url) {
            this.messageService.add({
              severity: 'error',
              summary: 'Facturación',
              detail: 'No se recibió URL de checkout. Revisa la configuración Stripe del plan.',
            });
            return;
          }
          globalThis.location.href = session.url;
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Facturación',
            detail: err.message ?? 'No se pudo iniciar el checkout.',
          });
        },
      });
  }
}
