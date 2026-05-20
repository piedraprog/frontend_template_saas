import { Routes } from '@angular/router';
import { sessionGuard } from './core/guards/session.guard';

/**
 * Rutas sin `companyId` (ni otro id) en la URL.
 * El contexto de organización va en JWT + cabecera `X-Company-ID` (ver `auth.interceptor.ts`).
 */
export const routes: Routes = [
  {
    path: 'terms-conditions',
    loadComponent: () =>
      import('./pages/public/terms-conditions/terms-conditions.component').then(
        (m) => m.TermsConditionsComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./pages/public/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./pages/public/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'success',
    loadComponent: () =>
      import('./pages/public/auth/success-register/success-register.component').then(
        (m) => m.SuccessRegisterComponent,
      ),
  },
  {
    path: 'forgot-password',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./pages/public/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./pages/public/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '',
    loadChildren: () => import('./pages/private/private.routes').then((m) => m.ADMIN_ROUTES),
  },
];
