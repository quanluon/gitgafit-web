import {
  Goal,
  ExperienceLevel,
  DayOfWeek,
  ActivityLevel,
  Gender,
  Language,
  TrainingEnvironment,
} from './enums';

export interface LocalizedText<T = string> {
  en: T;
  vi: T;
}

export interface TrainingRecommendation {
  generatedAt: string;
  title: LocalizedText;
  summary: LocalizedText;
  metrics: Record<string, unknown>;
  cta?: LocalizedText;
}

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
  trainingRecommendation?: TrainingRecommendation;
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
