import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansService } from '../../../../core/services/plans.service';
import { UserService } from '../../../../core/services/user.service';
import {
  SubscriptionUsage,
  PlanSummary,
  SubscriptionStatus,
} from '../../../../core/models/interfaces/subscription.interface';
import { CurrentPlanCardComponent } from './components/current-plan-card/current-plan-card.component';
// T5: Addons ocultos hasta integrar pasarela
// import { Addon } from '../../../../core/models/plan.model';
// import { AddonListComponent } from './components/addon-list/addon-list.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ViewPlansModalComponent } from './components/view-plans-modal/view-plans-modal.component';

@Component({
  selector: 'app-membership',
  imports: [CommonModule, CurrentPlanCardComponent, PageHeaderComponent, ViewPlansModalComponent],
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
})
export class MembershipComponent implements OnInit {
  private plansService = inject(PlansService);
  private userService = inject(UserService);

  currentPlan = signal<PlanSummary | null>(null);
  currentSubscription = signal<SubscriptionStatus | null>(null);
  usage = signal<SubscriptionUsage | null>(null);
  // T5: Addons ocultos hasta integrar pasarela
  // availableAddons = signal<Addon[]>([]);

  /** T6: Ver planes usa GET /plans (modal), no el summary. El summary solo para estado actual y uso. */
  showViewPlansModal = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const companyId = this.userService.userData().companyId;
    if (!companyId) return;

    // T5: Solo summary; no se pide getAddons() hasta integrar pasarela
    this.plansService.getSubscriptionSummary(companyId).subscribe({
      next: (summary) => {
        this.currentPlan.set(summary.plan);
        this.currentSubscription.set(summary.subscription);
        this.usage.set(summary.usage);
        // this.availableAddons.set(allAddons.filter((a) => a.isActive));
      },
      error: (err) => console.error('Error loading membership data', err),
    });
    // forkJoin({ summary: ..., allAddons: this.plansService.getAddons() }) deshabilitado T5
  }

  handleUpgradePlan() {
    this.showViewPlansModal.set(true);
  }

  // T5: Addons ocultos hasta integrar pasarela. Descomentar cuando se reactive la sección de addons.
  // handleBuyAddon(addon: Addon) {
  //   const companyId = this.userService.userData().companyId;
  //   if (
  //     !confirm(
  //       `¿Estás seguro de solicitar el addon "${addon.name || addon.featureSlug}" por $${addon.monthlyPrice}/mes?`,
  //     )
  //   ) {
  //     return;
  //   }
  //   this.plansService
  //     .requestAddon(companyId, addon.id, 'Solicitud desde panel de administración')
  //     .subscribe({
  //       next: () => {
  //         alert('Solicitud enviada con éxito. Un administrador revisará tu petición.');
  //         this.loadData();
  //       },
  //       error: (err) => {
  //         console.error('Error requesting addon', err);
  //         alert('Error al solicitar el addon.');
  //       },
  //     });
  // }
}
