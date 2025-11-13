import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum GenerationType {
  WORKOUT = 'workout',
  MEAL = 'meal',
}

export enum GenerationStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error',
}

interface GenerationJob {
  jobId: string;
  type: GenerationType;
  status: GenerationStatus;
  progress: number;
  message: string;
  error?: string;
  resultId?: string;
  startedAt: number; // Timestamp
}

interface GenerationState {
  jobs: GenerationJob[];
  isExpanded: boolean;
  startGeneration: (jobId: string, type: GenerationType) => void;
  updateProgress: (jobId: string, progress: number, message: string) => void;
  completeGeneration: (jobId: string, resultId?: string) => void;
  failGeneration: (jobId: string, error: string) => void;
  clearJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  clearStaleJobs: () => void;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'generation-jobs';
const MAX_JOB_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      jobs: [],
      isExpanded: false,

      startGeneration: (jobId: string, type: GenerationType): void => {
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          jobId,
          type,
          status: GenerationStatus.GENERATING,
          progress: 0,
          message: 'Starting generation...',
          startedAt: Date.now(),
        },
      ],
      isExpanded: false,
    }));
  },

  updateProgress: (jobId: string, progress: number, message: string): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.jobId === jobId
          ? {
              ...job,
              progress,
              message,
              status: GenerationStatus.GENERATING,
            }
          : job
      ),
    }));
  },

  completeGeneration: (jobId: string, resultId?: string): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.jobId === jobId
          ? {
              ...job,
              status: GenerationStatus.COMPLETED,
              progress: 100,
              message: 'Generation complete!',
              resultId,
            }
          : job
      ),
    }));
  },

  failGeneration: (jobId: string, error: string): void => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.jobId === jobId
          ? {
              ...job,
              status: GenerationStatus.ERROR,
              message: 'Generation failed',
              error,
            }
          : job
      ),
    }));
  },

  clearJob: (jobId: string): void => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.jobId !== jobId),
    }));
  },

  clearCompletedJobs: (): void => {
    set((state) => ({
      jobs: state.jobs.filter(
        (job) => job.status !== GenerationStatus.COMPLETED && job.status !== GenerationStatus.ERROR
      ),
    }));
  },

  clearStaleJobs: (): void => {
    const now = Date.now();
    set((state) => ({
      jobs: state.jobs.filter((job) => {
        const age = now - job.startedAt;
        return age < MAX_JOB_AGE_MS;
      }),
    }));
  },

  toggleExpanded: (): void => {
    set((state) => ({ isExpanded: !state.isExpanded }));
  },

  setExpanded: (expanded: boolean): void => {
    set({ isExpanded: expanded });
  },

      hydrate: (): void => {
        // Clear stale jobs on hydration
        get().clearStaleJobs();
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state: GenerationState) => ({
        jobs: state.jobs.filter((job: GenerationJob) => job.status === GenerationStatus.GENERATING),
        isExpanded: false,
      }),
    }
  )
);

