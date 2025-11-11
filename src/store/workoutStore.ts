import { create } from 'zustand';
import { WorkoutPlan, WorkoutDay } from '@/types/workout';
import { DayOfWeek } from '@/types/enums';

interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  selectedDay: DayOfWeek | null;
  todaysWorkout: WorkoutDay | null;
  setCurrentPlan: (plan: WorkoutPlan) => void;
  setSelectedDay: (day: DayOfWeek) => void;
  setTodaysWorkout: (workout: WorkoutDay | null) => void;
  clearWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  currentPlan: null,
  selectedDay: null,
  todaysWorkout: null,
  setCurrentPlan: (plan: WorkoutPlan): void => {
    set({ currentPlan: plan });
  },
  setSelectedDay: (day: DayOfWeek): void => {
    set({ selectedDay: day });
  },
  setTodaysWorkout: (workout: WorkoutDay | null): void => {
    set({ todaysWorkout: workout });
  },
  clearWorkout: (): void => {
    set({ currentPlan: null, selectedDay: null, todaysWorkout: null });
  },
}));

