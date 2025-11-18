import { apiClient } from './api';
import { FeedbackContext } from '@/types';

export interface FeedbackPayload {
  message: string;
  email?: string;
  context: FeedbackContext;
  userId?: string;
  path?: string;
  locale?: string;
}
export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const body: Record<string, unknown> = {
    message: payload.message,
    context: payload.context,
  };

  if (payload.email) {
    body.email = payload.email;
  }
  if (payload.userId) {
    body.userId = payload.userId;
  }
  if (payload.path) {
    body.path = payload.path;
  }
  const resolvedLocale =
    payload.locale || (typeof navigator !== 'undefined' ? navigator.language : undefined);
  if (resolvedLocale) {
    body.locale = resolvedLocale;
  }
  const headers: Record<string, string> = {};
  const appVersion = import.meta.env.VITE_APP_VERSION;
  if (appVersion) {
    headers['X-App-Version'] = appVersion;
  }
  await apiClient.post('/feedback', body, {
    headers,
  });
}
