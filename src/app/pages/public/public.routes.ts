import { Routes } from '@angular/router';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'terms-conditions',
    component: TermsConditionsComponent,
  },
];
