/**
 * Límites de plan genéricos.
 * Los proyectos concretos pueden extender esta interfaz con sus propios límites de negocio.
 */
export interface PlanLimits {
  max_members: number;
  max_storage_mb: number;
  [key: string]: number; // permite límites adicionales en proyectos específicos
}

export interface PlanInterface {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceYearly: number | null;
  monthlyPrice: number;
  annualPrice: number;
  limits: PlanLimits;
  features: string[]; // slugs de features activas
  isActive: boolean;
}

export interface AddonInterface {
  id: string;
  featureSlug: string;
  monthlyPrice: number;
  currency: string;
  isActive: boolean;
  type: 'FEATURE' | 'LIMIT';
  limitKey?: string;
  limitAmount?: number;
  name?: string;
  description?: string;
  icon?: string;
}
