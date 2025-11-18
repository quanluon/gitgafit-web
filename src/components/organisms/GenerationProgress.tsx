import { AppRoutePath } from '@/routes/paths';
import { Button } from '@atoms/Button';
import { GenerationStatus, GenerationType, useGenerationStore } from '@store/generationStore';
import { CheckCircle, ChevronDown, Loader2, X, XCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import Draggable from 'react-draggable';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
  const { showSuccess, showError, dismiss } = useToast();
  const { jobs, isExpanded, toggleExpanded, clearJob, setExpanded } = useGenerationStore();

  // Track which jobs have shown toasts to prevent duplicates
  const [notifiedJobs, setNotifiedJobs] = React.useState<Set<string>>(new Set());
  const bubbleRef = React.useRef<HTMLDivElement>(null);

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
          : job.type === GenerationType.MEAL
            ? t('generation.mealReady')
            : t('generation.inbodyReady');
      const route =
        job.type === GenerationType.WORKOUT
          ? AppRoutePath.WorkoutPreview
          : job.type === GenerationType.MEAL
            ? AppRoutePath.MealPlanner
            : AppRoutePath.Inbody;

      // Mark as notified
      setNotifiedJobs((prev) => new Set(prev).add(job.jobId));

      // Show toast
      showSuccess(
        (toastInstance) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold">{readyMessage}</p>
              <p className="text-sm text-muted-foreground">{t('generation.clickToView')}</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                dismiss(toastInstance.id);
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
        },
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
      showError(job.error || t('generation.failed'), {
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
      : currentJob?.type === GenerationType.MEAL
        ? t('generation.mealPlan')
        : t('generation.inbodyPlan');

  // Count active generations
  const activeCount = activeJobs.length;

  return <></>;

  return (
    <div className="z-50">
      {!isExpanded && (
        <Draggable nodeRef={bubbleRef} bounds="body" defaultPosition={{ x: 0, y: 0 }}>
          <div ref={bubbleRef} className="fixed bottom-24 right-4" style={{ touchAction: 'none' }}>
            <button
              onClick={toggleExpanded}
              className="group relative flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-transform duration-300"
              aria-label={t('generation.progress')}
            >
              <div className="relative">
                {isGenerating && <Loader2 className="h-5 w-5 animate-spin" />}
                {isCompleted && <CheckCircle className="h-5 w-5" />}
                {isError && <XCircle className="h-5 w-5" />}
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
                      strokeDasharray={`${currentJob?.progress || 0}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              <span className="absolute -bottom-1 text-[10px] font-semibold opacity-90">
                {isGenerating && `${currentJob?.progress || 0}%`}
                {isCompleted && 'OK'}
                {isError && 'ERR'}
              </span>

              {activeCount > 1 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold shadow">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </Draggable>
      )}
      {isExpanded && (
        <div className="fixed bottom-4 right-4 w-80 bg-card border rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
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
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleExpanded}>
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
                {activeJobs.map((job) => {
                  const label =
                    job.type === GenerationType.WORKOUT
                      ? `🏋️ ${t('generation.workoutPlan')}`
                      : job.type === GenerationType.MEAL
                        ? `🍽️ ${t('generation.mealPlan')}`
                        : `🧪 ${t('generation.inbodyPlan')}`;
                  return (
                    <div key={job.jobId} className="flex items-center justify-between text-xs">
                      <span>{label}</span>
                      <span className="font-semibold">{job.progress}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Current job details */}
            {currentJob && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">{jobTypeLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentJob.message ||
                      (currentJob.type === GenerationType.INBODY
                        ? t('generation.inbodyAnalyzing')
                        : t('generation.generating'))}
                  </p>
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
                          ? AppRoutePath.WorkoutPreview
                          : currentJob.type === GenerationType.MEAL
                            ? AppRoutePath.MealPlanner
                            : AppRoutePath.Inbody;
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
