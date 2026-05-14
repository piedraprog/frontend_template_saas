/**
 * Permisos base SaaS (32-bit masking). Debe coincidir con
 * `server-boilerplate-pg/src/modules/users/domain/enums/permissions.enum.ts`.
 *
 * Owner: el backend expone `isOwner: true` y `permissions: -1`; el cliente trata -1 como acceso total.
 */
export enum Permission {
  USERS_VIEW = 1 << 1,
  USERS_INVITE = 1 << 2,
  USERS_EDIT = 1 << 3,
  USERS_DELETE = 1 << 4,
  ROLES_MANAGE = 1 << 5,
  AUDITS_VIEW = 1 << 6,
  NOTIFICATIONS_VIEW = 1 << 7,
}

export function hasPermission(mask: number, perm: Permission): boolean {
  if (mask === -1) return true;
  return (mask & perm) === perm;
}
