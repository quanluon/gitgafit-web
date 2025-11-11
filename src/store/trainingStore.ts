import { create } from 'zustand';
import { TrainingSession } from '@/types/workout';

interface TrainingState {
  currentSession: TrainingSession | null;
  setCurrentSession: (session: TrainingSession | null) => void;
  clearSession: () => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  currentSession: null,
  setCurrentSession: (session: TrainingSession | null): void => {
    set({ currentSession: session });
  },
  clearSession: (): void => {
    set({ currentSession: null });
  },
}));

