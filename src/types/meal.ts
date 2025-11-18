import { DayOfWeek, MealType } from './enums';
import { Translatable } from './common';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealComponent {
  name: Translatable;
  quantity: string;
  notes: Translatable;
}

export interface MealItem {
  name: Translatable;
  description?: Translatable;
  quantity: string;
  macros: Macros;
  components?: MealComponent[];
}

export interface Meal {
  type: MealType;
  items: MealItem[];
  totalMacros: Macros;
}

export interface DailyMealPlan {
  dayOfWeek: DayOfWeek;
  meals: Meal[];
  dailyTotals: Macros;
}

export interface MealPlan {
  _id: string;
  userId: string;
  week: number;
  year: number;
  dailyTargets: Macros;
  tdee: number;
  schedule: DailyMealPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface TDEECalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}
