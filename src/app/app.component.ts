import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingIndicatorComponent],
  template: `
    <div class="min-h-screen">
      <app-loading-indicator />
      <router-outlet />
    </div>
  `,
})
export class AppComponent {}
