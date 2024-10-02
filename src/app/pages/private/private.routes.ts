import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminLoyautComponent } from './admin-loyaut/admin-loyaut.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', component: AdminLoyautComponent, children: [
      { path: '', component: DashboardComponent },
    ]
  }
];
