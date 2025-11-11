import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { TrainingSession } from '@/types/workout';
import { DayOfWeek, SessionStatus } from '@/types/enums';

interface StartSessionRequest {
  planId: string;
  dayOfWeek: DayOfWeek;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: ExerciseSet[];
}

interface LogExerciseRequest {
  exercises: ExerciseLog[];
}

class TrainingServiceClass {
  async startSession(data: StartSessionRequest): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>('/training/session/start', data);
    return response.data.data!;
  }

  async getActiveSession(): Promise<TrainingSession | null> {
    const response = await apiClient.get<ApiResponse<TrainingSession | null>>('/training/session/active');
    return response.data.data!;
  }

  async getSession(sessionId: string): Promise<TrainingSession> {
    const response = await apiClient.get<ApiResponse<TrainingSession>>(`/training/session/${sessionId}`);
    return response.data.data!;
  }

  async logExercise(sessionId: string, data: LogExerciseRequest): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}/log`,
      data
    );
    return response.data.data!;
  }

  async completeSession(sessionId: string): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}/complete`
    );
    return response.data.data!;
  }

  async cancelSession(sessionId: string): Promise<TrainingSession> {
    const response = await apiClient.post<ApiResponse<TrainingSession>>(
      `/training/session/${sessionId}/cancel`
    );
    return response.data.data!;
  }

  async getRecentSessions(limit?: number): Promise<TrainingSession[]> {
    const response = await apiClient.get<ApiResponse<TrainingSession[]>>(
      `/training/sessions/recent${limit ? `?limit=${limit}` : ''}`
    );
    return response.data.data!;
  }

  async getUserSessions(status?: SessionStatus): Promise<TrainingSession[]> {
    const response = await apiClient.get<ApiResponse<TrainingSession[]>>(
      `/training/sessions${status ? `?status=${status}` : ''}`
    );
    return response.data.data!;
  }
}

export const trainingService = new TrainingServiceClass();
