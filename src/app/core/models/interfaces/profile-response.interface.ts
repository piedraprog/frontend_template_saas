import { RoleEnum } from '../enums/role.enum';

export interface ProfileResponseInterface {
  id: string;
  username: string;
  email: string;
  role: RoleEnum;
  companyId: string;
}
