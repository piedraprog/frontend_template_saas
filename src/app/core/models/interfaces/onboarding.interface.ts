import { PlanInterface } from './plan.interface';

export interface OnboardingStepInterface {
  id: string;
  title: string;
  description: string;
  kind: 'info' | 'plan-selection';
  isCurrent: boolean;
  isCompleted: boolean;
}

export interface OnboardingStateInterface {
  variant: string;
  isCompleted: boolean;
  completedAt: string | Date | null;
  currentStepId: string;
  steps: OnboardingStepInterface[];
  hasActiveSubscription: boolean;
  companyPlanId: string | null;
}

export interface OnboardingViewModelInterface {
  state: OnboardingStateInterface;
  plans: PlanInterface[];
}
