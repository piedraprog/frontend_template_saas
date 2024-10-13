import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/public/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dahsboard',
    loadChildren: () => import('./pages/private/private.routes').then((m) => m.ADMIN_ROUTES),
  },
];
