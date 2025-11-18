import { DayOfWeek, ExperienceLevel, Goal } from '@/types/enums';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 'goal' | 'experience' | 'body' | 'schedule' | 'summary';

export interface OnboardingDraft {
  goal?: Goal;
  experienceLevel?: ExperienceLevel;
  height?: number;
  weight?: number;
  targetWeight?: number;
  scheduleDays?: DayOfWeek[];
  workoutTimeMinutes?: number;
  workoutNotes?: string;
}
interface OnboardingState {
  draft: OnboardingDraft;
  currentStep: OnboardingStep;
  updateDraft: (data: Partial<OnboardingDraft>) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  resetDraft: () => void;
}
const DEFAULT_DRAFT: OnboardingDraft = {
  workoutTimeMinutes: 60,
  workoutNotes: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: DEFAULT_DRAFT,
      currentStep: 'goal',
      updateDraft: (data): void =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...data,
          },
        })),
      setCurrentStep: (step): void => set({ currentStep: step }),
      resetDraft: (): void =>
        set({
          draft: DEFAULT_DRAFT,
          currentStep: 'goal',
        }),
    }),
    {
      name: 'onboarding-draft',
      version: 1,
      partialize: (state) => ({
        draft: state.draft,
        currentStep: state.currentStep,
      }),
    },
  ),
);

