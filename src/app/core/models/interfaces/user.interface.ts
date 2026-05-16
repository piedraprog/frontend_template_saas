import { SystemRole } from '../enums/system-role.enum';

export interface UserInterface {
  id: string;
  username: string;
  email: string;
  role: SystemRole;
  /** Etiqueta de rol devuelta por el backend para UI */
  roleName?: string;
  companyId: string;
  isOwner: boolean;
  onboardingVariant?: string;
  onboardingCurrentStep?: string;
  onboardingCompletedAt?: string | Date | null;
  permissions: number;
  active: boolean;
  /** Permisos personalizados (bitmask); si difiere del rol, el usuario aparece como “personalizado”. */
  customPermissions?: number | null;
  customRoleId?: string;
  avatar?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
