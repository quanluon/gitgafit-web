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

// WebSocket event names for real-time notifications
export enum WebSocketEvent {
  // Connection
  REGISTER_USER = 'register-user',
  REGISTRATION_SUCCESS = 'registration-success',

  // Workout generation
  WORKOUT_GENERATION_STARTED = 'workout-generation-started',
  WORKOUT_GENERATION_PROGRESS = 'workout-generation-progress',
  WORKOUT_GENERATION_COMPLETE = 'workout-generation-complete',
  WORKOUT_GENERATION_ERROR = 'workout-generation-error',

  // Meal plan generation
  MEAL_GENERATION_STARTED = 'meal-generation-started',
  MEAL_GENERATION_PROGRESS = 'meal-generation-progress',
  MEAL_GENERATION_COMPLETE = 'meal-generation-complete',
  MEAL_GENERATION_ERROR = 'meal-generation-error',
}

export enum Language {
  EN = 'en',
  VI = 'vi',
}

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
