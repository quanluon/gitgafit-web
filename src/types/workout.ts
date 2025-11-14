import { DayOfWeek, SessionStatus, PlanSource } from './enums';
import { Translatable } from './common';

export interface Exercise {
  _id?: string;
  exerciseId?: string;
  name: Translatable;
  description: Translatable;
  sets: number;
  reps: string;
  videoUrl: string;
}

export interface WorkoutDay {
  dayOfWeek: DayOfWeek;
  focus: Translatable;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  _id: string;
  userId: string;
  source: PlanSource;
  title?: string;
  week: number;
  year: number;
  schedule: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomPlanPayload {
  title?: string;
  schedule: WorkoutDay[];
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  name: Translatable;
  description?: Translatable;
  muscleGroup?: string;
  sets: ExerciseSet[];
  notes?: string;
  videoUrl?: string;
}

export interface TrainingSession {
  _id: string;
  userId: string;
  planId: string;
  dayOfWeek: DayOfWeek;
  workoutFocus?: Translatable;
  startTime: string;
  endTime?: string;
  exercises: ExerciseLog[];
  status: SessionStatus;
  totalVolume?: number;
  totalSets?: number;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

