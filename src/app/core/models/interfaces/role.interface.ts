export interface RoleInterface {
  id: string;
  name: string;
  permissions: number; // bitmask
  companyId: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleDto {
  name: string;
  permissions: number;
  companyId: string;
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: number;
}
