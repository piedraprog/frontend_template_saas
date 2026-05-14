import { Routes } from '@angular/router';

/**
 * Agrupación lazy opcional de pantallas públicas.
 * Las rutas activas del admin están en `app.routes.ts` (sin id de compañía en la URL).
 */
export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'terms-conditions',
    loadComponent: () =>
      import('./terms-conditions/terms-conditions.component').then(
        (m) => m.TermsConditionsComponent,
      ),
  },
];
