import { Routes } from '@angular/router';
import { ownerGuard } from '../../../core/guards/owner.guard';
import { permissionsGuard } from '../../../core/guards/permissions.guard';
import { Permission } from '../../../core/models/enums/permission.enum';
import ConfigurationComponent from './settings.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./settings-menu/settings-menu.component'),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile-config/profile-config.component'),
      },
      {
        path: 'user-admin',
        canActivate: [permissionsGuard],
        data: { permission: Permission.USERS_VIEW },
        loadComponent: () => import('./user-admin/user-admin.component'),
      },
      {
        path: 'roles',
        canActivate: [permissionsGuard],
        data: { permission: Permission.ROLES_MANAGE },
        loadComponent: () => import('./roles/roles.component'),
      },
      {
        path: 'membership',
        canActivate: [ownerGuard],
        loadComponent: () =>
          import('./membership/membership.component').then((m) => m.MembershipComponent),
      },
      {
        path: 'company',
        canActivate: [ownerGuard],
        loadComponent: () => import('./company-settings/company-settings.component'),
      },
      {
        path: 'notification',
        loadComponent: () => import('./notification-config/notification-config.component'),
      },
    ],
  },
];
