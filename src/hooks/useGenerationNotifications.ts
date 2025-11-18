import { useEffect } from 'react';
import { fcmService } from '@services/fcmService';
import { queueService } from '@services/queueService';
import { useGenerationStore, GenerationType, GenerationStatus } from '@store/generationStore';
import { useAuthStore } from '@store/authStore';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

export function useGenerationNotifications(): void {
  const { completeGeneration, failGeneration, setJobs } = useGenerationStore();
  const { isAuthenticated, user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchActiveJobs = async (): Promise<void> => {
      if (!isAuthenticated || !user?._id) {
        return;
      }

      try {
        const activeJobs = await queueService.getActiveJobs();
        const formattedJobs = activeJobs.map((job) => ({
          jobId: job.jobId,
          type: job.type,
          status: GenerationStatus.GENERATING,
          progress: job.progress,
          message: job.message || t('generation.generating'),
        }));
        setJobs(formattedJobs);
      } catch (error) {
        console.error('Failed to fetch active jobs', error);
      }
    };

    void fetchActiveJobs();
  }, [isAuthenticated, setJobs, t, user?._id]);

  useEffect(() => {
    const unsubscribe = fcmService.addMessageListener((payload) => {
      const data = payload.data;
      if (!data?.generationType || !data.jobId) return;

      const type = data.generationType as GenerationType;
      const jobId = data.jobId;
      const category = data.notificationCategory;
      const resultId = data.resultId || data.planId;

      if (category === 'complete') {
        completeGeneration(jobId, resultId);

        const messageMap: Record<GenerationType, string> = {
          [GenerationType.WORKOUT]:
            t('generation.workoutComplete') || 'Workout plan generated successfully!',
          [GenerationType.MEAL]:
            t('generation.mealPlanComplete') || 'Meal plan generated successfully!',
          [GenerationType.INBODY]:
            t('generation.inbodyComplete') || 'InBody scan analyzed successfully!',
          [GenerationType.BODY_PHOTO]:
            t('generation.bodyPhotoComplete') || 'Body photo analyzed successfully!',
        };
        showSuccess(messageMap[type]);
      } else if (category === 'error') {
        failGeneration(jobId, data.error || 'Generation failed');
        showError(data.error || t('generation.failed') || 'Generation failed');
      }
    });

    void fcmService.initMessaging();

    return () => {
      unsubscribe?.();
    };
  }, [completeGeneration, failGeneration, showError, showSuccess, t]);
}

