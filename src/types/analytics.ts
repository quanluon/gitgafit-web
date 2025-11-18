export interface WeightHistory {
  date: string;
  weight: number;
}

export interface WeightLog {
  _id: string;
  userId: string;
  weight: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  totalSessions: number;
  completedSessions: number;
  totalWorkoutTime: number;
  averageWorkoutDuration: number;
  currentStreak: number;
}

export interface ExercisePR {
  exerciseName: string;
  maxWeight: number;
  date: string;
}

export interface Award {
  _id: string;
  userId: string;
  exerciseName: string;
  value: number;
  date: string;
  percentile: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}
