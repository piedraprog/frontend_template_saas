import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { onboardingGuard } from '../../core/guards/onboarding.guard';
import { userResolver } from '../../core/resolvers/user.resolver';
import BaseLayoutComponent from '../../shared/components/base-layout/base-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'onboarding',
    canActivate: [authGuard],
    resolve: { userId: userResolver },
    loadComponent: () => import('./onboarding/onboarding.component'),
  },
  {
    path: '',
    component: BaseLayoutComponent,
    canActivate: [authGuard, onboardingGuard],
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
