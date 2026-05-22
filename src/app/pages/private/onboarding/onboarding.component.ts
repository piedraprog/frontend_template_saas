import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { PlansService } from '../../../core/services/plans.service';
import {
  OnboardingStateInterface,
  OnboardingStepInterface,
} from '../../../core/models/interfaces/onboarding.interface';
import { PlanInterface } from '../../../core/models/interfaces/plan.interface';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, ToastModule],
  providers: [MessageService],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingComponent implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly plansService = inject(PlansService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  progressing = signal(false);
  checkoutPlanId = signal<string | null>(null);
  error = signal<string | null>(null);
  state = signal<OnboardingStateInterface | null>(null);
  plans = signal<PlanInterface[]>([]);
  processingBillingReturn = signal(false);

  get currentStep(): OnboardingStepInterface | null {
    const currentStepId = this.state()?.currentStepId;
    return this.state()?.steps.find((step) => step.id === currentStepId) ?? null;
  }

  get canChooseLater(): boolean {
    return this.plans().some((plan) => plan.allowsDeferredOnboardingChoice === true);
  }

  ngOnInit(): void {
    this.loadViewModel();
    this.handleBillingReturn();
  }

  loadViewModel(): void {
    this.loading.set(true);
    this.error.set(null);

    this.onboardingService
      .loadViewModel()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ state, plans }) => {
          this.state.set(state);
          this.plans.set(plans);
        },
        error: (err: Error) => {
          this.error.set(err.message ?? 'No se pudo cargar el onboarding');
        },
      });
  }

  handleBillingReturn(): void {
    this.route.queryParamMap.subscribe((params) => {
      const billingStatus = params.get('billing');
      const sessionId = params.get('session_id');

      if (billingStatus === 'cancelled') {
        this.messageService.add({
          severity: 'warn',
          summary: 'Facturación',
          detail: 'El checkout fue cancelado. Puedes elegir otro plan o intentarlo de nuevo.',
        });
        return;
      }

      if (billingStatus === 'success' && sessionId) {
        void this.waitForBillingActivation(sessionId);
      }
    });
  }

  async waitForBillingActivation(sessionId: string): Promise<void> {
    if (this.processingBillingReturn()) {
      return;
    }

    this.processingBillingReturn.set(true);
    this.loading.set(true);
    this.error.set(null);

    const confirmed = await this.tryConfirmStripeSession(sessionId);
    if (confirmed) {
      this.processingBillingReturn.set(false);
      this.loading.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Facturación',
        detail: 'La suscripción se activó correctamente. Entrando al dashboard.',
      });
      void this.router.navigate(['/dashboard']);
      return;
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const activated = await this.tryRefreshAfterBilling();
      if (activated) {
        this.processingBillingReturn.set(false);
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Facturación',
          detail: 'La suscripción se activó correctamente. Entrando al dashboard.',
        });
        void this.router.navigate(['/dashboard']);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    this.processingBillingReturn.set(false);
    this.loading.set(false);
    this.messageService.add({
      severity: 'info',
      summary: 'Facturación',
      detail:
        'El pago volvió correctamente, pero la activación aún no aparece. Verifica que Stripe CLI esté reenviando webhooks al backend local.',
    });
  }

  async tryConfirmStripeSession(sessionId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.onboardingService.confirmStripeSession(sessionId).subscribe({
        next: (state) => {
          this.state.set(state);
          resolve(Boolean(state.isCompleted || state.hasActiveSubscription));
        },
        error: () => resolve(false),
      });
    });
  }

  async tryRefreshAfterBilling(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.onboardingService.loadViewModel().subscribe({
        next: ({ state, plans }) => {
          this.state.set(state);
          this.plans.set(plans);
          resolve(Boolean(state.isCompleted || state.hasActiveSubscription));
        },
        error: () => resolve(false),
      });
    });
  }

  continueStep(): void {
    const steps = this.state()?.steps ?? [];
    const currentIndex = steps.findIndex((step) => step.id === this.state()?.currentStepId);
    const nextStep = steps[currentIndex + 1];

    if (!nextStep) {
      return;
    }

    this.progressing.set(true);
    this.onboardingService
      .updateProgress(nextStep.id)
      .pipe(finalize(() => this.progressing.set(false)))
      .subscribe({
        next: (state) => this.state.set(state),
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Facturación',
            detail: err.message ?? 'No se pudo avanzar el onboarding.',
          });
        },
      });
  }

  enterDashboard(): void {
    this.progressing.set(true);
    this.onboardingService
      .complete()
      .pipe(finalize(() => this.progressing.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/dashboard');
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Facturación',
            detail: err.message ?? 'No se pudo finalizar el onboarding.',
          });
        },
      });
  }

  chooseLater(): void {
    this.progressing.set(true);
    this.onboardingService
      .chooseLater()
      .pipe(finalize(() => this.progressing.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/dashboard');
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Facturación',
            detail: err.message ?? 'No se pudo activar la opción de decidir después.',
          });
        },
      });
  }

  startPlanCheckout(plan: PlanInterface): void {
    this.checkoutPlanId.set(plan.id);
    this.plansService
      .createSubscriptionCheckout(plan.id, 'stripe', 'onboarding')
      .pipe(finalize(() => this.checkoutPlanId.set(null)))
      .subscribe({
        next: (session) => {
          if (!session.url) {
            this.messageService.add({
              severity: 'error',
              summary: 'Facturación',
              detail: 'No se recibió URL de checkout para Stripe.',
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

  planPrice(plan: PlanInterface): number {
    return plan.monthlyPrice ?? plan.price ?? 0;
  }

  planActionLabel(plan: PlanInterface): string {
    if (plan.billingModel === 'free') {
      return 'Activar gratis';
    }

    if (plan.billingModel === 'trial') {
      const days = plan.trialDays ?? 14;
      return `Iniciar trial de ${days} días`;
    }

    return 'Continuar con Stripe';
  }

  activateDeferredPlan(plan: PlanInterface): void {
    if (plan.billingModel === 'paid') {
      this.startPlanCheckout(plan);
      return;
    }

    this.progressing.set(true);
    this.onboardingService
      .activatePlanSelection(plan.id)
      .pipe(finalize(() => this.progressing.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/dashboard');
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Facturación',
            detail: err.message ?? 'No se pudo activar el plan seleccionado.',
          });
        },
      });
  }
}
