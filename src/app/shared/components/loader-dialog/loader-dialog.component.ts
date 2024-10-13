import { Component, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader-dialog',
  standalone: true,
  imports: [DialogModule, ProgressSpinnerModule],
  template: `
    <p-dialog
      [(visible)]="show"
      [style]="{ width: '250px' }"
      [baseZIndex]="10000"
      [closable]="true"
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

// TODO: Cambiar a signals
export class LoaderDialogComponent {
  @Input() show: boolean = false;

  constructor() {
    // setTimeout(() => {
    //   this.show = false;
    // }, 13000);
  }
}
