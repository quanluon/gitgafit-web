export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export const UNLIMITED_LIMIT = -1;

export interface GenerationStats {
  used: number;
  limit: number;
  remaining: number;
  resetsOn: string;
}

export interface SubscriptionStats {
  plan: SubscriptionPlan;
  periodStart: string;
  workout: GenerationStats;
  meal: GenerationStats;
  inbody: GenerationStats;
}

