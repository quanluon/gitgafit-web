import { useEffect, useRef } from 'react';
import { useGenerationStore, GenerationType, GenerationStatus, GenerationJob } from '@store/generationStore';
import { socketService, WebSocketEvent } from '@services/socketService';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface UseGenerationJobOptions {
  type: GenerationType;
  onComplete?: (resultId?: string) => void;
}
/**
 * Hook to manage generation job lifecycle
 * - Checks job status once when active job is found
 * - Listens for completion via socket (for alerts)
 * - Manages job state in generation store
 */
export function useGenerationJob({
  type,
  onComplete,
}: UseGenerationJobOptions): {
  hasActiveGeneration: boolean;
  activeJob: GenerationJob | undefined;
  progress: number;
  message: string;
} {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { jobs, completeGeneration, failGeneration } = useGenerationStore();
  const handledJobIdsRef = useRef<Set<string>>(new Set());

  // Get active job for this type
  const activeJob = jobs.find(
    (job) => job.type === type && job.status === GenerationStatus.GENERATING,
  );

  const hasActiveGeneration = !!activeJob;

  // Listen for completion events via socket (for alerts only)
  useEffect(() => {
    const eventMap: Record<GenerationType, WebSocketEvent> = {
      [GenerationType.WORKOUT]: WebSocketEvent.WORKOUT_GENERATION_COMPLETE,
      [GenerationType.MEAL]: WebSocketEvent.MEAL_GENERATION_COMPLETE,
      [GenerationType.INBODY]: WebSocketEvent.INBODY_OCR_COMPLETE,
      [GenerationType.BODY_PHOTO]: WebSocketEvent.BODY_PHOTO_ANALYSIS_COMPLETE,
    };

    const errorEventMap: Record<GenerationType, WebSocketEvent> = {
      [GenerationType.WORKOUT]: WebSocketEvent.WORKOUT_GENERATION_ERROR,
      [GenerationType.MEAL]: WebSocketEvent.MEAL_GENERATION_ERROR,
      [GenerationType.INBODY]: WebSocketEvent.INBODY_OCR_ERROR,
      [GenerationType.BODY_PHOTO]: WebSocketEvent.BODY_PHOTO_ANALYSIS_ERROR,
    };

    const completeEvent = eventMap[type];
    const errorEvent = errorEventMap[type];

    if (!completeEvent || !errorEvent) return;

    const unsubscribeComplete = socketService.on(completeEvent, (data) => {
      if (data.jobId) {
        const jobId = data.jobId.toString();
        if (!handledJobIdsRef.current.has(jobId)) {
          handledJobIdsRef.current.add(jobId);
          completeGeneration(jobId, data.planId || data.resultId);
          onComplete?.(data.planId || data.resultId);

          const messages: Record<GenerationType, string> = {
            [GenerationType.WORKOUT]:
              t('generation.workoutComplete') || 'Workout plan generated successfully!',
            [GenerationType.MEAL]:
              t('generation.mealPlanComplete') || 'Meal plan generated successfully!',
            [GenerationType.INBODY]:
              t('generation.inbodyComplete') || 'InBody scan analyzed successfully!',
            [GenerationType.BODY_PHOTO]:
              t('generation.bodyPhotoComplete') || 'Body photo analyzed successfully!',
          };
          showSuccess(messages[type]);
        }
      }
    });

    const unsubscribeError = socketService.on(errorEvent, (data) => {
      if (data.jobId) {
        const jobId = data.jobId.toString();
        if (!handledJobIdsRef.current.has(jobId)) {
          handledJobIdsRef.current.add(jobId);
          failGeneration(jobId, data.error || 'Generation failed');
          showError(data.error || t('generation.failed') || 'Generation failed');
        }
      }
    });

    return (): void => {
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [type, showSuccess, showError, t, completeGeneration, failGeneration, onComplete]);

  return {
    hasActiveGeneration,
    activeJob,
    progress: activeJob?.progress || 0,
    message: activeJob?.message || '',
  };
}
