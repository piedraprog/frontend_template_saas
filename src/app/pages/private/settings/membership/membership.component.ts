import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansService } from '../../../../core/services/plans.service';
import {
  SubscriptionUsage,
  PlanSummary,
  SubscriptionStatus,
} from '../../../../core/models/interfaces/subscription.interface';
import { CurrentPlanCardComponent } from './components/current-plan-card/current-plan-card.component';
import { Addon } from '../../../../core/models/plan.model';
import { AddonListComponent } from './components/addon-list/addon-list.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ViewPlansModalComponent } from './components/view-plans-modal/view-plans-modal.component';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [
    CommonModule,
    CurrentPlanCardComponent,
    PageHeaderComponent,
    ViewPlansModalComponent,
    AddonListComponent,
    RouterModule,
  ],
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
})
export class MembershipComponent implements OnInit {
  private plansService = inject(PlansService);

  currentPlan = signal<PlanSummary | null>(null);
  currentSubscription = signal<SubscriptionStatus | null>(null);
  usage = signal<SubscriptionUsage | null>(null);
  availableAddons = signal<Addon[]>([]);

  /** T6: Ver planes usa GET /plans (modal), no el summary. El summary solo para estado actual y uso. */
  showViewPlansModal = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    forkJoin({
      summary: this.plansService.getSubscriptionSummary(),
      allAddons: this.plansService.getAddons(),
    }).subscribe({
      next: ({ summary, allAddons }) => {
        this.currentPlan.set(summary.plan);
        this.currentSubscription.set(summary.subscription);
        this.usage.set(summary.usage);
        this.availableAddons.set((allAddons ?? []).filter((addon) => addon.isActive !== false));
      },
      error: (err) => console.error('Error loading membership data', err),
    });
  }

  handleUpgradePlan() {
    this.showViewPlansModal.set(true);
  }

  handleManageBilling() {
    this.plansService.createCustomerPortal().subscribe({
      next: (portal) => {
        if (!portal.url) {
          alert('No se recibió URL del portal de facturación.');
          return;
        }

        globalThis.location.href = portal.url;
      },
      error: (err) => {
        console.error('Error opening customer portal', err);
        alert(err?.message ?? 'No se pudo abrir el portal de facturación.');
      },
    });
  }

  handleBuyAddon(addon: Addon) {
    this.plansService.createAddonCheckout(addon.id, 'stripe', 'monthly', 'settings').subscribe({
      next: (session) => {
        if (!session.url) {
          alert('No se recibió URL de checkout para el addon.');
          return;
        }

        globalThis.location.href = session.url;
      },
      error: (err) => {
        console.error('Error starting addon checkout', err);
        alert(err?.message ?? 'Error al iniciar el checkout del addon.');
      },
    });
  }
}
