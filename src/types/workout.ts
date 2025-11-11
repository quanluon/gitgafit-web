import { DayOfWeek, SessionStatus } from './enums';
import { Translatable } from './common';

export interface Exercise {
  _id?: string;
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
  week: number;
  year: number;
  schedule: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
}

export interface TrainingSession {
  _id: string;
  userId: string;
  planId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime?: string;
  exercises: ExerciseLog[];
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

