import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../../../core/services/loading.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader-dialog',
  standalone: true,
  imports: [DialogModule, ProgressSpinnerModule, AsyncPipe],
  template: `
    <p-dialog
      [(visible)]="show"
      [style]="{ width: '250px' }"
      [baseZIndex]="10000"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [modal]="true"
    >
      <div class="flex flex-column justify-content-center align-items-center">
        <p-progressSpinner ariaLabel="loading" strokeWidth="4" animationDuration="4s" />
        <span class="font-bold">Cargando</span>
      </div>
    </p-dialog>
  `,
})
export class LoaderDialogComponent {
  show = false;

  constructor(private loaderService: LoaderService) {
    this.loaderService.showLoader$.subscribe((show) => {
      this.show = show;
    });
  }
}
