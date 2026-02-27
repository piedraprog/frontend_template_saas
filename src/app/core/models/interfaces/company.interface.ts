export interface CompanyInterface {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  ownerId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
