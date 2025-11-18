import { apiClient } from './api';
import { ApiResponse } from '@/types/common';
import { ExerciseCatalogItem, ExerciseSearchParams } from '@/types/exercise';

class ExerciseServiceClass {
  async searchExercises(params: ExerciseSearchParams = {}): Promise<ExerciseCatalogItem[]> {
    const response = await apiClient.get<ApiResponse<ExerciseCatalogItem[]>>('/exercises', {
      params,
    });
    return response.data.data ?? [];
  }
}
export const exerciseService = new ExerciseServiceClass();


