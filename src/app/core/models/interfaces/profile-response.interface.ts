export interface ProfileCustomRole {
  id: string;
  name: string;
  permissions: number;
}

/** Cuerpo devuelto por GET /auth/profile (Nest). */
export interface ProfileResponseInterface {
  id: string;
  username: string;
  email: string;
  companyId: string;
  avatar?: string;
  permissions: number;
  isOwner: boolean;
  customPermissions?: number | null;
  customRoleId?: string;
  customRole?: ProfileCustomRole | null;
}
