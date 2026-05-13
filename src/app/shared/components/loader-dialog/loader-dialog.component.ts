import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loader-dialog',
  standalone: true,
  imports: [DialogModule, ProgressSpinnerModule],
  template: `
    <p-dialog
      [visible]="loaderService.isVisible()"
      [style]="{ width: '250px' }"
      [baseZIndex]="10000"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [modal]="true"
    >
      <div class="flex flex-col justify-center items-center">
        <p-progressSpinner ariaLabel="loading" strokeWidth="4" animationDuration="4s" />
        <span class="font-bold">Cargando</span>
      </div>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderDialogComponent {
  protected readonly loaderService = inject(LoaderService);
}
