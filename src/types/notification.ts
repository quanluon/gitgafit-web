export enum NotificationEvent {
  // Workout generation events
  WORKOUT_GENERATION_STARTED = 'workout-generation-started',
  WORKOUT_GENERATION_PROGRESS = 'workout-generation-progress',
  WORKOUT_GENERATION_COMPLETE = 'workout-generation-complete',
  WORKOUT_GENERATION_ERROR = 'workout-generation-error',

  // Connection events
  REGISTRATION_SUCCESS = 'registration-success',
  REGISTRATION_ERROR = 'registration-error',

  // General events
  NOTIFICATION = 'notification',
}

export interface NotificationData {
  jobId?: string | number;
  progress?: number;
  message?: string;
  planId?: string;
  error?: string;
}

export interface JobStatus {
  id: string;
  state: string;
  progress: number;
  result?: {
    planId: string;
    userId: string;
  };
  failedReason?: string;
}

