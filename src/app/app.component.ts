import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderDialogComponent } from './shared/components/loader-dialog/loader-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderDialogComponent],
  template: `
    <app-loader-dialog />
    <router-outlet />
  `,
})
export class AppComponent {}
