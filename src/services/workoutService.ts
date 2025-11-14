import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { WorkoutPlan, WorkoutDay } from '@/types/workout';
import { Goal, ExperienceLevel, DayOfWeek } from '@/types/enums';

interface GeneratePlanRequest {
  goal: Goal;
  experienceLevel: ExperienceLevel;
  scheduleDays: DayOfWeek[];
  weight?: number;
  height?: number;
  targetWeight?: number;
}

interface JobResponse {
  jobId: string;
  message: string;
}

class WorkoutServiceClass {
  async generatePlan(data: GeneratePlanRequest): Promise<JobResponse> {
    const response = await apiClient.post<ApiResponse<JobResponse>>('/workout/plan/generate', data);
    return response.data.data!;
  }

  async getCurrentPlan(): Promise<WorkoutPlan> {
    const response = await apiClient.get<ApiResponse<WorkoutPlan>>('/workout/plan');
    return response.data.data!;
  }

  async getWorkoutByDay(day: DayOfWeek): Promise<WorkoutDay | null> {
    const response = await apiClient.get<ApiResponse<WorkoutDay | null>>('/workout/plan/day', {
      params: { day },
    });
    return response.data.data!;
  }

  async updatePlan(planId: string, updateData: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const response = await apiClient.patch<ApiResponse<WorkoutPlan>>(
      `/workout/plan/${planId}`,
      updateData,
    );
    return response.data.data!;
  }

  async createCustomPlan(planData: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const response = await apiClient.post<ApiResponse<WorkoutPlan>>(
      '/workout/plan/custom',
      planData,
    );
    return response.data.data!;
  }
}

export const workoutService = new WorkoutServiceClass();

