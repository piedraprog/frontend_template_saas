import { PlanInterface } from './plan.interface';

export interface UsageMetric {
  limit: number | 'Unlimited';
  currentUsage: number;
  remaining: number | 'Unlimited';
  exceeded: boolean;
  percentageUsed: number;
}

export interface SubscriptionUsage {
  max_members?: UsageMetric;
  [key: string]: UsageMetric | undefined;
}

export interface PlanSummary {
  id: string;
  name: string;
  description: string;
  price: number;
  priceYearly: number | null;
}

export interface SubscriptionStatus {
  id: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  gatewayProvider?: string | null;
  customerPortalAvailable?: boolean;
}

export interface SubscriptionSummary {
  plan: PlanSummary;
  subscription: SubscriptionStatus;
  usage: SubscriptionUsage;
}

export interface SubscriptionInterface {
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: Date;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate?: Date;
  plan?: PlanInterface;
}
