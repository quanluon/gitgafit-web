import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import { useGenerationStore, GenerationStatus, GenerationType } from '@store/generationStore';
import { socketService, WebSocketEvent } from '@services/socketService';
import { queueService } from '@services/queueService';

interface NotificationPayload {
  jobId?: string | number;
  resultId?: string;
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
  const { startGeneration, updateProgress, completeGeneration, failGeneration, setJobs } =
    useGenerationStore();


  // Fetch active jobs from backend on mount
  useEffect(() => {
    const fetchActiveJobs = async (): Promise<void> => {
      if (isAuthenticated && user?._id) {
        try {
          const activeJobs = await queueService.getActiveJobs();
          
          // Convert to generation store format
          const jobs = activeJobs.map((job) => ({
            jobId: job.jobId,
            type: job.type,
            status: GenerationStatus.GENERATING,
            progress: job.progress,
            message: job.message || 'Generating...',
          }));
          
          setJobs(jobs);
        } catch (error) {
          console.error('Failed to fetch active jobs:', error);
        }
      }
    };

    fetchActiveJobs();
  }, [isAuthenticated, user?._id, setJobs]);

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

      const unsubscribeInbodyStarted = socketService.on(
        WebSocketEvent.INBODY_OCR_STARTED,
        (data) => {
          if (data.jobId) {
            startGeneration(data.jobId.toString(), GenerationType.INBODY);
          }
        }
      );

      const unsubscribeInbodyProgress = socketService.on(
        WebSocketEvent.INBODY_OCR_PROGRESS,
        (data) => {
          if (data.jobId) {
            updateProgress(
              data.jobId.toString(),
              data.progress || 0,
              data.message || 'Analyzing InBody scan...'
            );
          }
        }
      );

      const unsubscribeInbodyComplete = socketService.on(
        WebSocketEvent.INBODY_OCR_COMPLETE,
        (data: { jobId?: string | number; resultId?: string }) => {
          if (data.jobId) {
            completeGeneration(data.jobId.toString(), data.resultId);
          }
        }
      );

      const unsubscribeInbodyError = socketService.on(
        WebSocketEvent.INBODY_OCR_ERROR,
        (data) => {
          if (data.jobId) {
            failGeneration(data.jobId.toString(), data.error || 'Scan failed');
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
        unsubscribeInbodyStarted();
        unsubscribeInbodyProgress();
        unsubscribeInbodyComplete();
        unsubscribeInbodyError();
        
        // Cleanup socket connection
        socketService.disconnect();
      };
    }
    return undefined;
  }, [isAuthenticated, user?._id, startGeneration, updateProgress, completeGeneration, failGeneration]);
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
