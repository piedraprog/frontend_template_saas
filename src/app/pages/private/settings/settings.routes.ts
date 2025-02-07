import { Routes } from '@angular/router';
import ConfigurationComponent from './settings.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./profile-config/profile-config.component'),
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing-config/billing-config.component'),
      },
      {
        path: 'team',
        loadComponent: () => import('./team-config/team-config.component'),
      },
      {
        path: 'notification',
        loadComponent: () => import('./notification-config/notification-config.component'),
      },
    ],
  },
];
