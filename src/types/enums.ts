export enum Goal {
  MUSCLE_GAIN = 'muscle_gain',
  WEIGHT_LOSS = 'weight_loss',
  MAINTENANCE = 'maintenance',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum SessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Language {
  EN = 'en',
  VI = 'vi',
}

export const LANGUAGE_OPTIONS = [
  { value: Language.VI, label: '🇻🇳 Tiếng Việt' },
  { value: Language.EN, label: '🇬🇧 English' },
];

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  LEGS = 'legs',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  CORE = 'core',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
}

export enum PlanSource {
  AI = 'ai',
  CUSTOM = 'custom',
}

export enum FeedbackContext {
  GENERAL = 'general',
  WORKOUT = 'workout',
  MEAL = 'meal',
  INBODY = 'inbody',
  PROFILE = 'profile',
  OTHER = 'other',
}

export enum TrainingEnvironment {
  FULL_GYM = 'full_gym',
  LIMITED_GYM = 'limited_gym',
  BODYWEIGHT = 'bodyweight',
}
