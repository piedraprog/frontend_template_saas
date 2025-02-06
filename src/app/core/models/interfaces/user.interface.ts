import { RoleEnum } from '../enums/role.enum';

export interface UserInterface {
  id: string;
  username: string;
  email: string;
  role: RoleEnum;
  companyId: string;
}
