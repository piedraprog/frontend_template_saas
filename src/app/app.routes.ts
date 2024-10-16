import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { sessionGuard } from './core/guards/session.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/public/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    canActivate: [sessionGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/private/private.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [authGuard],
  },
];
