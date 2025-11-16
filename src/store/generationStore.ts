import { create } from 'zustand';

export enum GenerationType {
  WORKOUT = 'workout',
  MEAL = 'meal',
  INBODY = 'inbody',
  BODY_PHOTO = 'bodyPhoto',
}

export enum GenerationStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface GenerationJob {
  jobId: string;
  type: GenerationType;
  status: GenerationStatus;
  progress: number;
  message: string;
  error?: string;
  resultId?: string;
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
  setJobs: (jobs: GenerationJob[]) => void;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
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

  setJobs: (jobs: GenerationJob[]): void => {
    set({ jobs });
  },

  toggleExpanded: (): void => {
    set((state) => ({ isExpanded: !state.isExpanded }));
  },

  setExpanded: (expanded: boolean): void => {
    set({ isExpanded: expanded });
  },
}));

