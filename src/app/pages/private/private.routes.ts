import { Routes } from '@angular/router';
import { userResolver } from '../../core/resolvers/user.resolver';
import BaseLayoutComponent from '../../shared/components/base-layout/base-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    resolve: { userId: userResolver },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component'),
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },
];
