declare module 'firebase/analytics' {
  import { FirebaseApp } from 'firebase/app';

  export interface Analytics {}
  export function getAnalytics(app: FirebaseApp): Analytics;
  export function logEvent(analytics: Analytics, eventName: string, params?: Record<string, unknown>): void;
}
