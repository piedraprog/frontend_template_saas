import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterModule],
  template: `
    <div class="bg-gray-200 flex gap-4">
      <app-sidebar></app-sidebar>
      <router-outlet></router-outlet>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BaseLayoutComponent {}
