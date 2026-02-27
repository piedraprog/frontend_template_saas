/**
 * Permisos base SaaS usando 32-bit masking.
 * Owner tiene mask -1 (acceso total).
 *
 * Al añadir un módulo de negocio, extender este enum en el proyecto correspondiente.
 * IMPORTANTE: Debe sincronizarse con el backend (Permission enum en server-boilerplate-pg).
 */
export enum Permission {
  // --- Usuarios ---
  USERS_VIEW = 1 << 0, // Ver lista de usuarios
  USERS_CREATE = 1 << 1, // Crear nuevos usuarios
  USERS_UPDATE = 1 << 2, // Editar usuarios existentes
  USERS_DELETE = 1 << 3, // Eliminar usuarios

  // --- Roles ---
  ROLES_VIEW = 1 << 4, // Ver lista de roles
  ROLES_CREATE = 1 << 5, // Crear roles personalizados
  ROLES_UPDATE = 1 << 6, // Editar roles
  ROLES_DELETE = 1 << 7, // Eliminar roles

  // --- Auditoría ---
  AUDITS_VIEW = 1 << 8, // Ver logs de auditoría

  // --- Notificaciones ---
  NOTIFICATIONS_VIEW = 1 << 9, // Ver notificaciones
}

export function hasPermission(mask: number, perm: Permission): boolean {
  if (mask === -1) return true;
  return (mask & perm) === perm;
}
