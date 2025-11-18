import { useCallback, useRef, useState } from 'react';
import { ExerciseCatalogItem, ExerciseSearchParams } from '@/types/exercise';
import { exerciseService } from '@services/exerciseService';

interface UseExerciseCatalogResult {
  exercises: ExerciseCatalogItem[];
  isLoading: boolean;
  error: string | null;
  search: (params?: ExerciseSearchParams) => Promise<void>;
}
export function useExerciseCatalog(
  initialParams: ExerciseSearchParams = {},
): UseExerciseCatalogResult {
  const [exercises, setExercises] = useState<ExerciseCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastParamsRef = useRef<ExerciseSearchParams>(initialParams);

  const search = useCallback(
    async (params?: ExerciseSearchParams): Promise<void> => {
      const query = params ?? lastParamsRef.current;
      lastParamsRef.current = query;
      try {
        setIsLoading(true);
        setError(null);
        const results = await exerciseService.searchExercises(query);
        setExercises(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load exercises';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    exercises,
    isLoading,
    error,
    search,
  };
}

