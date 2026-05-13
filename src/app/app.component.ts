import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderDialogComponent } from './shared/components/loader-dialog/loader-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderDialogComponent],
  template: `
    <div class="min-h-screen">
      <app-loader-dialog />
      <router-outlet />
    </div>
  `,
})
export class AppComponent {}
