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
        path: 'configuration',
        loadComponent: () => import('./configuration/configuration.component'),
      },
    ],
  },
];
