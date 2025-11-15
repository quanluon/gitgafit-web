import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { MealPlan, TDEECalculation } from '@/types/meal';
import { DayOfWeek } from '@/types/enums';

interface GenerateMealPlanRequest {
  scheduleDays?: DayOfWeek[];
  useAI?: boolean;
  fullWeek?: boolean;
  notes?: string;
}

interface JobResponse {
  jobId: string;
  message: string;
}

class MealServiceClass {
  async generateMealPlan(data?: GenerateMealPlanRequest): Promise<JobResponse> {
    const response = await apiClient.post<ApiResponse<JobResponse>>('/meal/plan/generate', data || {});
    return response.data.data!;
  }

  async getCurrentPlan(): Promise<MealPlan> {
    const response = await apiClient.get<ApiResponse<MealPlan>>('/meal/plan');
    return response.data.data!;
  }

  async getTDEE(): Promise<TDEECalculation> {
    const response = await apiClient.get<ApiResponse<TDEECalculation>>('/meal/tdee');
    return response.data.data!;
  }
}

export const mealService = new MealServiceClass();

