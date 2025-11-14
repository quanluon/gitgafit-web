import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { TrainingSession } from '@/types/workout';
import { DayOfWeek } from '@/types/enums';

interface StartSessionDto {
  planId: string;
  dayOfWeek: DayOfWeek;
}

interface LogExerciseDto {
  exercises: Array<{
    exerciseId: string;
    name: { en: string; vi: string };
    description?: { en: string; vi: string };
    muscleGroup?: string;
    sets: Array<{ reps: number; weight: number }>;
    notes?: string;
    videoUrl?: string;
  }>;
}

class TrainingService {
  async startSession(data: StartSessionDto): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      '/training/session/start',
      data,
    );
    return response.data.data!;
  }

  async getActiveSession(): Promise<TrainingSession | null> {
    const response = await apiClient.get<ApiResponse<TrainingSession | null>>(
      '/training/session/active',
    );
    return response.data.data!;
  }

  async getSessionById(sessionId: string): Promise<TrainingSession> {
    const response = await apiClient.get<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}`,
    );
    return response.data.data!;
  }

  async logExercise(sessionId: string, data: LogExerciseDto): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}/log`,
      data,
    );
    return response.data.data!;
  }

  async completeSession(sessionId: string): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}/complete`,
    );
    return response.data.data!;
  }

  async cancelSession(sessionId: string): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}/cancel`,
    );
    return response.data.data!;
  }

  async getSessionsByMonth(year: number, month: number): Promise<TrainingSession[]> {
    const response = await apiClient.get<ApiResponse<TrainingSession[]>>(
      `/training/sessions/month/${year}/${month}`,
    );
    return response.data.data!;
  }

  async getRecentSessions(limit: number = 10): Promise<TrainingSession[]> {
    const response = await apiClient.get<ApiResponse<TrainingSession[]>>(
      `/training/sessions/recent?limit=${limit}`,
    );
    return response.data.data!;
  }
}

export const trainingService = new TrainingService();
