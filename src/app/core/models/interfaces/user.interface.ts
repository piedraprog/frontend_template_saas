import { SystemRole } from '../enums/system-role.enum';

export interface UserInterface {
  id: string;
  username: string;
  email: string;
  role: SystemRole;
  companyId: string;
  isOwner: boolean;
  permissions: number;
  active: boolean;
  customRoleId?: string;
  avatar?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
