import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import { useGenerationStore } from '@store/generationStore';
import { socketService, WebSocketEvent } from '@services/socketService';

interface NotificationPayload {
  jobId: string | number;
  progress?: number;
  message?: string;
  planId?: string;
  error?: string;
}

type EventHandler = (data: NotificationPayload) => void;

/**
 * Hook to manage Socket.IO connection based on auth state
 * Also sets up automatic generation store updates from WebSocket events
 */
export function useSocket(): void {
  const { user, isAuthenticated } = useAuthStore();
  const { updateProgress, completeGeneration, failGeneration, clearStaleJobs } = useGenerationStore();

  // Clear stale jobs on mount
  useEffect(() => {
    clearStaleJobs();
  }, [clearStaleJobs]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Connect socket when user is authenticated
      socketService.connect(user._id);

      // Setup automatic generation progress updates
      const unsubscribeWorkoutProgress = socketService.on(
        WebSocketEvent.WORKOUT_GENERATION_PROGRESS,
        (data) => {
          if (data.jobId) {
            updateProgress(
              data.jobId.toString(),
              data.progress || 0,
              data.message || 'Generating workout plan...'
            );
          }
        }
      );

      const unsubscribeWorkoutComplete = socketService.on(
        WebSocketEvent.WORKOUT_GENERATION_COMPLETE,
        (data) => {
          if (data.jobId) {
            completeGeneration(data.jobId.toString(), data.planId);
          }
        }
      );

      const unsubscribeWorkoutError = socketService.on(
        WebSocketEvent.WORKOUT_GENERATION_ERROR,
        (data) => {
          if (data.jobId) {
            failGeneration(data.jobId.toString(), data.error || 'Generation failed');
          }
        }
      );

      const unsubscribeMealProgress = socketService.on(
        WebSocketEvent.MEAL_GENERATION_PROGRESS,
        (data) => {
          if (data.jobId) {
            updateProgress(
              data.jobId.toString(),
              data.progress || 0,
              data.message || 'Generating meal plan...'
            );
          }
        }
      );

      const unsubscribeMealComplete = socketService.on(
        WebSocketEvent.MEAL_GENERATION_COMPLETE,
        (data) => {
          if (data.jobId) {
            completeGeneration(data.jobId.toString(), data.planId);
          }
        }
      );

      const unsubscribeMealError = socketService.on(
        WebSocketEvent.MEAL_GENERATION_ERROR,
        (data) => {
          if (data.jobId) {
            failGeneration(data.jobId.toString(), data.error || 'Generation failed');
          }
        }
      );

      return (): void => {
        // Cleanup subscriptions
        unsubscribeWorkoutProgress();
        unsubscribeWorkoutComplete();
        unsubscribeWorkoutError();
        unsubscribeMealProgress();
        unsubscribeMealComplete();
        unsubscribeMealError();
        
        // Cleanup socket connection
        socketService.disconnect();
      };
    }
    return undefined;
  }, [isAuthenticated, user?._id, updateProgress, completeGeneration, failGeneration]);
}

/**
 * Hook to subscribe to specific WebSocket event
 */
export function useSocketEvent(event: WebSocketEvent, handler: EventHandler): void {
  useEffect(() => {
    const unsubscribe = socketService.on(event, handler);

    return () => {
      unsubscribe();
    };
  }, [event, handler]);
}
