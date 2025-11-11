import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { WeightHistory, WeightLog, ProgressStats, ExercisePR, Award } from '@/types/analytics';

interface LogWeightRequest {
  weight: number;
  notes?: string;
}

class AnalyticsServiceClass {
  async getWeightHistory(days: number = 90): Promise<WeightHistory[]> {
    const response = await apiClient.get<ApiResponse<WeightHistory[]>>(
      '/analytics/weight-history',
      { params: { days } },
    );
    return response.data.data!;
  }

  async logWeight(data: LogWeightRequest): Promise<WeightLog> {
    const response = await apiClient.post<ApiResponse<WeightLog>>('/analytics/weight', data);
    return response.data.data!;
  }

  async getProgressStats(): Promise<ProgressStats> {
    const response = await apiClient.get<ApiResponse<ProgressStats>>('/analytics/progress');
    return response.data.data!;
  }

  async getExercisePRs(): Promise<ExercisePR[]> {
    const response = await apiClient.get<ApiResponse<ExercisePR[]>>('/analytics/prs');
    return response.data.data!;
  }

  async getAwards(limit: number = 10): Promise<Award[]> {
    const response = await apiClient.get<ApiResponse<Award[]>>('/analytics/awards', {
      params: { limit },
    });
    return response.data.data!;
  }

  async getTopAwards(limit: number = 5): Promise<Award[]> {
    const response = await apiClient.get<ApiResponse<Award[]>>('/analytics/awards/top', {
      params: { limit },
    });
    return response.data.data!;
  }
}

export const analyticsService = new AnalyticsServiceClass();

