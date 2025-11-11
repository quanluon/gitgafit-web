import { Goal, ExperienceLevel, DayOfWeek, ActivityLevel, Gender } from './enums';

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
  scheduleDays: DayOfWeek[];
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
  scheduleDays: DayOfWeek[];
}

