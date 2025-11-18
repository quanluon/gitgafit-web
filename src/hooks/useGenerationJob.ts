import { useEffect, useRef } from 'react';
import { useGenerationStore, GenerationType, GenerationStatus, GenerationJob } from '@store/generationStore';

interface UseGenerationJobOptions {
  type: GenerationType;
  onComplete?: (resultId?: string) => void;
}
/**
 * Hook to manage generation job lifecycle
 * - Tracks jobs stored in generation store
 * - Notifies caller when a job completes
 * - Mirrors latest progress/message for UI
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
  const { jobs } = useGenerationStore();
  const statusMapRef = useRef<Map<string, GenerationStatus>>(new Map());

  // Get active job for this type
  const activeJob = jobs.find(
    (job) => job.type === type && job.status === GenerationStatus.GENERATING,
  );

  const hasActiveGeneration = !!activeJob;

  useEffect(() => {
    jobs.forEach((job) => {
      const previousStatus = statusMapRef.current.get(job.jobId);
      if (previousStatus !== job.status) {
        statusMapRef.current.set(job.jobId, job.status);
      }

      if (
        job.type === type &&
        job.status === GenerationStatus.COMPLETED &&
        previousStatus !== GenerationStatus.COMPLETED
      ) {
        onComplete?.(job.resultId);
      }
    });

    // Remove entries for jobs no longer tracked
    const currentJobIds = new Set(jobs.map((job) => job.jobId));
    Array.from(statusMapRef.current.keys()).forEach((jobId) => {
      if (!currentJobIds.has(jobId)) {
        statusMapRef.current.delete(jobId);
      }
    });
  }, [jobs, onComplete, type]);

  return {
    hasActiveGeneration,
    activeJob,
    progress: activeJob?.progress || 0,
    message: activeJob?.message || '',
  };
}
