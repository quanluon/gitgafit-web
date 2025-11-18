import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { SubscriptionStats } from '@/types/subscription';

class SubscriptionService {
  async getStats(): Promise<SubscriptionStats> {
    const response = await apiClient.get<ApiResponse<SubscriptionStats>>(
      '/user/subscription/stats',
    );
    return response.data.data!;
  }
}
export const subscriptionService = new SubscriptionService();

