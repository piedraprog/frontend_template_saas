import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { UserService } from '../services/user.service';
import { Permission } from '../models/enums/permission.enum';

/**
 * Guard para proteger rutas basado en permisos SaaS.
 * Uso en rutas:
 * - Un solo permiso:              { data: { permission: Permission.NOMBRE } }
 * - Múltiples permisos (ANY):     { data: { permissionsAny: [Permission.A, Permission.B] } }
 * - Múltiples permisos (ALL):     { data: { permissionsAll: [Permission.A, Permission.B] } }
 */
export const permissionsGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const userService = inject(UserService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as Permission;
  const requiredPermissionsAny = route.data['permissionsAny'] as Permission[];
  const requiredPermissionsAll = route.data['permissionsAll'] as Permission[];

  // Si no se requiere ningún permiso, permitir acceso
  if (!requiredPermission && !requiredPermissionsAny && !requiredPermissionsAll) {
    return true;
  }

  // Verificar si el usuario está cargado
  const user = userService.userData();

  // Si el usuario no está cargado aún (recarga de página), permitir temporalmente
  if (!user || !user.id) {
    return true;
  }

  // Verificar permisos según el tipo
  let hasAccess = false;

  if (requiredPermission) {
    hasAccess = permissionService.has(requiredPermission);
  } else if (requiredPermissionsAny) {
    hasAccess = permissionService.hasAny(...requiredPermissionsAny);
  } else if (requiredPermissionsAll) {
    hasAccess = permissionService.hasAll(...requiredPermissionsAll);
  }

  if (hasAccess) {
    return true;
  }

  console.warn('PermissionsGuard: Access denied', {
    requiredPermission,
    requiredPermissionsAny,
    requiredPermissionsAll,
  });
  router.navigate(['', 'dashboard']);
  return false;
};
