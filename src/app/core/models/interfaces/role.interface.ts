export interface RoleInterface {
  id: string;
  name: string;
  permissions: number; // bitmask
  companyId: string;
  description?: string;
  isDefault?: boolean;
  /** Roles predefinidos del sistema vs roles creados por la empresa */
  isSystemRole?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleDto {
  name: string;
  permissions: number;
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: number;
}
