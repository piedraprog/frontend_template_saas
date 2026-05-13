import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

export interface UpgradeModalData {
  featureSlug: string;
  featureName: string;
  currentPlan?: string;
  requiredPlan?: string;
  description?: string;
  benefits?: string[];
}

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="flex flex-col items-center gap-3 p-4">
      <!-- Icon -->
      <i class="pi pi-lock text-7xl text-orange-500"></i>

      <!-- Title -->
      <h2 class="mt-3 text-center">
        {{ data()?.featureName || 'Función Premium' }}
      </h2>

      <!-- Description -->
      <p class="text-center text-gray-700 px-2">
        {{
          data()?.description ||
            'Esta función requiere un plan superior o un complemento específico.'
        }}
      </p>

      <!-- Current vs Required Plan -->
      @if (data()?.currentPlan && data()?.requiredPlan) {
        <div class="w-full px-4 py-3 bg-gray-100 rounded-lg">
          <div class="flex justify-between items-center">
            <div class="text-center flex-1">
              <p class="text-sm text-gray-600 m-0">Tu plan actual</p>
              <p class="text-lg font-bold m-0">{{ data()?.currentPlan }}</p>
            </div>
            <i class="pi pi-arrow-right text-2xl text-gray-400 mx-3"></i>
            <div class="text-center flex-1">
              <p class="text-sm text-gray-600 m-0">Plan requerido</p>
              <p class="text-lg font-bold text-orange-500 m-0">
                {{ data()?.requiredPlan }}
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Benefits List -->
      @if ((data()?.benefits?.length ?? 0) > 0) {
        <div class="w-full px-4">
          <p class="font-semibold mb-2">Con esta función podrás:</p>
          <ul class="list-none p-0 m-0">
            @for (benefit of data()!.benefits; track benefit) {
              <li class="flex items-start mb-2">
                <i class="pi pi-check text-green-500 mt-1 mr-2"></i>
                <span class="text-gray-700">{{ benefit }}</span>
              </li>
            }
          </ul>
        </div>
      }

      <!-- Actions -->
      <div class="flex gap-2 mt-3">
        <p-button
          label="Ver Planes"
          severity="success"
          (onClick)="viewPlans()"
          [outlined]="false"
        />
        <p-button label="Cerrar" severity="secondary" (onClick)="closeModal()" [outlined]="true" />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 500px;
        margin: 0 auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpgradeModalComponent {
  private readonly dialogRef = inject(DynamicDialogRef, { optional: true });
  private readonly router = inject(Router);

  data = input<UpgradeModalData>();

  viewPlans() {
    this.dialogRef?.close();

    // Navigate to plans/pricing page with preselected feature
    this.router.navigate(['/plans'], {
      queryParams: {
        feature: this.data()?.featureSlug,
        highlight: this.data()?.requiredPlan,
      },
    });
  }

  closeModal() {
    this.dialogRef?.close();
  }
}
