import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, RouterModule, ToastModule],
  template: `
    <p-toast position="top-right" [life]="5000" styleClass="app-toast-stack" />
    <div class="flex min-h-screen bg-slate-100 text-slate-900 antialiased">
      <app-sidebar />
      <main class="flex min-h-screen min-w-0 flex-1 flex-col overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BaseLayoutComponent {}
