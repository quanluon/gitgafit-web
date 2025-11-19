import {
  Goal,
  ExperienceLevel,
  DayOfWeek,
  ActivityLevel,
  Gender,
  Language,
  TrainingEnvironment,
} from './enums';

export interface User {
  _id: string;
  email: string;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  height?: number;
  weight?: number;
  targetWeight?: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  trainingEnvironment?: TrainingEnvironment;
  scheduleDays: DayOfWeek[];
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  goal: Goal;
  experienceLevel: ExperienceLevel;
  height: number;
  weight: number;
  targetWeight?: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  trainingEnvironment?: TrainingEnvironment;
  scheduleDays: DayOfWeek[];
}
