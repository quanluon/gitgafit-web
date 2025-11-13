export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface GenerationStats {
  used: number;
  limit: number;
  remaining: number;
}

export interface SubscriptionStats {
  plan: SubscriptionPlan;
  periodStart: string;
  workout: GenerationStats;
  meal: GenerationStats;
}

