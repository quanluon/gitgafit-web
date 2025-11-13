import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { X, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@atoms/Button';
import {
  useGenerationStore,
  GenerationType,
  GenerationStatus,
} from '@store/generationStore';

/**
 * Floating progress bubble for AI generation
 * Shows in bottom-right corner, allows users to:
 * - See generation progress without blocking UI
 * - Click to expand/collapse details
 * - Navigate to results when complete
 */
export function GenerationProgress(): React.ReactElement | null {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { jobs, isExpanded, toggleExpanded, clearJob, setExpanded } = useGenerationStore();

  // Track which jobs have shown toasts to prevent duplicates
  const [notifiedJobs, setNotifiedJobs] = React.useState<Set<string>>(new Set());

  // Get active jobs (generating)
  const activeJobs = jobs.filter((job) => job.status === GenerationStatus.GENERATING);
  
  // Get the most recent job to display
  const currentJob = jobs.length > 0 ? jobs[jobs.length - 1] : null;

  // Auto-handle completed and error jobs
  useEffect(() => {
    const completedJobs = jobs.filter((job) => job.status === GenerationStatus.COMPLETED);
    const errorJobs = jobs.filter((job) => job.status === GenerationStatus.ERROR);

    // Handle completed jobs
    completedJobs.forEach((job) => {
      // Skip if already notified
      if (notifiedJobs.has(job.jobId)) {
        return;
      }

      const readyMessage =
        job.type === GenerationType.WORKOUT
          ? t('generation.workoutReady')
          : t('generation.mealReady');
      const route = job.type === GenerationType.WORKOUT ? '/workout-preview' : '/meal-planner';

      // Mark as notified
      setNotifiedJobs((prev) => new Set(prev).add(job.jobId));

      // Show toast
      toast.success(
        (toastInstance) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold">{readyMessage}</p>
              <p className="text-sm text-muted-foreground">{t('generation.clickToView')}</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                toast.dismiss(toastInstance.id);
                navigate(route);
                clearJob(job.jobId);
              }}
            >
              {t('generation.viewPlan')}
            </Button>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-center',
          id: `completed-${job.jobId}`,
        }
      );

      // Auto-clear after 5 seconds
      setTimeout(() => {
        clearJob(job.jobId);
      }, 5000);
    });

    // Handle error jobs
    errorJobs.forEach((job) => {
      // Skip if already notified
      if (notifiedJobs.has(job.jobId)) {
        return;
      }

      // Mark as notified
      setNotifiedJobs((prev) => new Set(prev).add(job.jobId));

      // Show error toast
      toast.error(job.error || t('generation.failed'), {
        duration: 5000,
        position: 'top-center',
        id: `error-${job.jobId}`,
      });

      // Expand to show error
      setExpanded(true);

      // Auto-clear after 5 seconds
      setTimeout(() => {
        clearJob(job.jobId);
      }, 5000);
    });
  }, [jobs, navigate, clearJob, setExpanded, t, notifiedJobs]);

  if (jobs.length === 0) {
    return null;
  }

  const isGenerating = currentJob?.status === GenerationStatus.GENERATING;
  const isCompleted = currentJob?.status === GenerationStatus.COMPLETED;
  const isError = currentJob?.status === GenerationStatus.ERROR;

  const jobTypeLabel =
    currentJob?.type === GenerationType.WORKOUT 
      ? t('generation.workoutPlan')
      : t('generation.mealPlan');

  // Count active generations
  const activeCount = activeJobs.length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed Bubble */}
      {!isExpanded && (
        <button
          onClick={toggleExpanded}
          className="group relative flex items-center gap-3 bg-primary text-primary-foreground rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {/* Icon */}
          <div className="relative">
            {isGenerating && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {isCompleted && (
              <CheckCircle className="h-5 w-5" />
            )}
            {isError && (
              <XCircle className="h-5 w-5" />
            )}
            
            {/* Progress ring for generating state */}
            {isGenerating && (
              <svg
                className="absolute inset-0 -m-1 h-7 w-7 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${currentJob.progress}, 100`}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold">
              {isGenerating && `${currentJob?.progress || 0}%`}
              {isCompleted && t('generation.complete')}
              {isError && t('generation.failed')}
            </span>
            <span className="text-xs opacity-90">
              {activeCount > 1 
                ? `${activeCount} ${t('generation.generationsInProgress')}`
                : jobTypeLabel}
            </span>
          </div>

          {/* Expand indicator */}
          <ChevronUp className="h-4 w-4 opacity-70 group-hover:opacity-100" />
        </button>
      )}

      {/* Expanded Card */}
      {isExpanded && (
        <div className="bg-card border rounded-lg shadow-xl w-80 overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
              {isError && <XCircle className="h-4 w-4 text-destructive" />}
              <h3 className="font-semibold text-sm">
                {isGenerating && t('generation.generating')}
                {isCompleted && t('generation.complete')}
                {isError && t('generation.failed')}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleExpanded}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => currentJob && clearJob(currentJob.jobId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Show all active jobs */}
            {activeCount > 1 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs text-muted-foreground">
                  {activeCount} {t('generation.generationsInProgress')}:
                </p>
                {activeJobs.map((job) => (
                  <div key={job.jobId} className="flex items-center justify-between text-xs">
                    <span>
                      {job.type === GenerationType.WORKOUT 
                        ? `🏋️ ${t('generation.workoutPlan')}`
                        : `🍽️ ${t('generation.mealPlan')}`}
                    </span>
                    <span className="font-semibold">{job.progress}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Current job details */}
            {currentJob && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">{jobTypeLabel}</p>
                  <p className="text-xs text-muted-foreground">{currentJob.message}</p>
                </div>

                {/* Progress Bar (for generating state) */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t('generation.progress')}</span>
                      <span className="font-semibold">{currentJob.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${currentJob.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {isError && currentJob.error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-xs">
                    {currentJob.error}
                  </div>
                )}

                {/* Action Buttons */}
                {isCompleted && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      const route =
                        currentJob.type === GenerationType.WORKOUT
                          ? '/workout-preview'
                          : '/meal-planner';
                      navigate(route);
                      clearJob(currentJob.jobId);
                    }}
                  >
                    {t('generation.viewPlan')} {jobTypeLabel}
                  </Button>
                )}

                {isError && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => clearJob(currentJob.jobId)}
                  >
                    {t('generation.dismiss')}
                  </Button>
                )}

                {/* Info Text */}
                {isGenerating && (
                  <p className="text-xs text-muted-foreground text-center">
                    {activeCount > 1 
                      ? t('generation.continueUsingMultiple')
                      : t('generation.continueUsing')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

