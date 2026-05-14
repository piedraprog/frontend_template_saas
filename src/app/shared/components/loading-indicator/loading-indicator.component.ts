import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { LoaderService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [ProgressBarModule],
  template: `
    @if (loader.isPageVisible()) {
      <div class="app-loading-bar" role="status" aria-live="polite" aria-label="Cargando">
        <p-progressbar mode="indeterminate" [showValue]="false" />
      </div>
    }

    @if (loader.isBlockingVisible()) {
      <div class="app-loading-blocker" role="status" aria-live="assertive" aria-label="Procesando">
        <div class="app-loading-blocker__panel">
          <span class="app-loading-blocker__spinner" aria-hidden="true"></span>
          <span>Procesando</span>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicatorComponent {
  protected readonly loader = inject(LoaderService);
}
