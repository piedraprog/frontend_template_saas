/** Empresa del tenant (respuesta de GET /companies/me y PUT). */
export interface CompanyInterface {
  id: string;
  name: string;
  logo: string;
  ownerId: string | null;
  planId: string | null;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}
