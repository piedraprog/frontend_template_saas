import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterModule],
  template: `
    <div class="bg-gray-200 flex flex-row">
      <app-sidebar />

      <!-- Router outlet que ocupa el espacio restante -->
      <div class="flex-grow-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BaseLayoutComponent {}
