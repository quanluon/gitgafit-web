import { PlannerSkeleton } from '@/components/molecules';
import { useGenerationJob } from '@/hooks/useGenerationJob';
import { useToast } from '@/hooks/useToast';
import { AppRoutePath } from '@/routes/paths';
import { GenerationType } from '@/store/generationStore';
import { DayOfWeek, PlanSource } from '@/types/enums';
import { CustomPlanPayload, WorkoutDay, WorkoutPlan } from '@/types/workout';
import { Button } from '@atoms/Button';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { DaySelector } from '@molecules/DaySelector';
import { CreateCustomPlanModal } from '@organisms/CreateCustomPlanModal';
import { RedirectToOnboardingModal } from '@organisms/RedirectToOnboardingModal';
import { WorkoutCard } from '@organisms/WorkoutCard';
import { WorkoutDetailsModal } from '@organisms/WorkoutDetailsModal';
import { trainingService } from '@services/trainingService';
import { workoutService } from '@services/workoutService';
import { useTrainingStore } from '@store/trainingStore';
import { useWorkoutStore } from '@store/workoutStore';
import { MainLayout } from '@templates/MainLayout';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function PlannerPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentPlan, setCurrentPlan, setTodaysWorkout } = useWorkoutStore();
  const { currentSession, setCurrentSession } = useTrainingStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [todaysWorkout, setTodaysWorkoutLocal] = useState<WorkoutDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showRedirectModal, setShowRedirectModal] = useState<boolean>(false);
  const [isCustomPlanModalOpen, setCustomPlanModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const {
    refresh: refreshSubscriptionStats,
    formatQuotaDisplay,
    getQuotaInfo,
  } = useSubscriptionStats();

  // Get current day
  const getCurrentDay = (): DayOfWeek => {
    const today = new Date();
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    return Object.values(DayOfWeek)[dayIndex];
  };

  const loadWorkoutPlan = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [plan, activeSession] = await Promise.all([
        workoutService.getCurrentPlan(),
        trainingService.getActiveSession(),
      ]);

      setCurrentPlan(plan);
      setCurrentSession(activeSession);

      // Set current day as selected
      const currentDay = getCurrentDay();
      setSelectedDay(currentDay);
    } catch (err) {
      setShowRedirectModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setCurrentPlan, setCurrentSession, t]);

  useEffect(() => {
    void loadWorkoutPlan();
  }, [loadWorkoutPlan]);

  useEffect(() => {
    if (selectedDay && currentPlan) {
      const workout = currentPlan.schedule.find((w) => w.dayOfWeek === selectedDay);
      setTodaysWorkoutLocal(workout || null);
      setTodaysWorkout(workout || null);
    }
  }, [selectedDay, currentPlan, setTodaysWorkout]);

  // Use hook to handle generation completion
  useGenerationJob({
    type: GenerationType.WORKOUT,
    onComplete: () => {
      void loadWorkoutPlan();
      void refreshSubscriptionStats();
    },
  });

  const handleStartTraining = async (): Promise<void> => {
    if (!currentPlan || !selectedDay) return;

    // Check if there's an active session
    if (currentSession) {
      setError(t('training.completeFirst'));
      return;
    }
    try {
      const session = await trainingService.startSession({
        planId: currentPlan._id,
        dayOfWeek: selectedDay,
      });
      setCurrentSession(session);
      navigate(AppRoutePath.Training);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || t('training.failedToStart'));
    }
  };

  const handleSaveCustomPlan = async (payload: CustomPlanPayload): Promise<void> => {
    try {
      const plan = await workoutService.createCustomPlan(payload);
      setCurrentPlan(plan);
      setSelectedDay(plan.schedule[0]?.dayOfWeek ?? null);
      setTodaysWorkoutLocal(plan.schedule[0] ?? null);
      setTodaysWorkout(plan.schedule[0] ?? null);
      showSuccess(t('workout.customPlanCreated'));
      setCustomPlanModalOpen(false);
      setEditingPlan(null);
      await refreshSubscriptionStats();
    } catch (error) {
      console.error('Failed to create custom plan:', error);
      showError(t('workout.failedToCreatePlan'));
    }
  };

  const handleDeletePlan = async (): Promise<void> => {
    if (!currentPlan) return;
    try {
      await workoutService.deletePlan(currentPlan._id);
      showSuccess(t('workout.customPlanDeleted'));
      await loadWorkoutPlan();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      showError(t('workout.failedToDeletePlan'));
    }
  };

  const openCustomPlanner = (): void => {
    setEditingPlan(null);
    setCustomPlanModalOpen(true);
  };

  const openEditCustomPlan = (): void => {
    if (!currentPlan) return;
    setEditingPlan(currentPlan);
    setCustomPlanModalOpen(true);
  };

  const availableDays = currentPlan?.schedule.map((w) => w.dayOfWeek) || [];
  const quotaDisplay = formatQuotaDisplay(GenerationType.WORKOUT);
  const quotaInfo = getQuotaInfo(GenerationType.WORKOUT);

  if (isLoading) {
    return (
      <MainLayout>
        <PlannerSkeleton />
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b stickyyy top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{t('workout.planner')}</h1>
                {currentPlan?.source === PlanSource.CUSTOM && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {t('workout.customPlanTag')}
                  </span>
                )}
              </div>
              {currentPlan?.title && (
                <p className="text-sm text-muted-foreground">{currentPlan.title}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentPlan?.source === PlanSource.CUSTOM ? (
                <>
                  <Button variant="outline" size="sm" onClick={openEditCustomPlan}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('workout.editCustomPlan')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDeletePlan}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('workout.deletePlan')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={openCustomPlanner}>
                    <Plus className="mr-2 h-4 w-4" />
                  </Button>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(): void => navigate(AppRoutePath.Onboarding)}
                      disabled={quotaInfo?.isDepleted}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t('common.regenerate')}
                      {quotaDisplay && (
                        <div className="ml-1 text-xs text-muted-foreground">{quotaDisplay}</div>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {/* Active Session Alert */}
        {currentSession && (
          <div className="bg-primary/10 border border-primary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t('training.activeSession')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('training.sessionFor')} {currentSession.dayOfWeek}
                </p>
              </div>
              <Button onClick={(): void => navigate(AppRoutePath.Training)}>
                {t('training.continueSession')}
              </Button>
            </div>
          </div>
        )}
        {/* Day Selector */}
        {currentPlan && (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t('workout.selectDay')}</h2>
              <DaySelector
                selectedDay={selectedDay}
                availableDays={availableDays}
                onDaySelect={setSelectedDay}
              />
            </div>
          </>
        )}
        {/* Today's Workout Card */}
        {todaysWorkout && (
          <WorkoutCard
            workout={todaysWorkout}
            onStartTraining={handleStartTraining}
            onManage={(): void => navigate(AppRoutePath.Profile)}
            onViewDetails={(): void => setShowDetailsModal(true)}
            disabled={!!currentSession}
          />
        )}
        {!todaysWorkout && selectedDay && (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('workout.noWorkoutScheduled')}</p>
          </div>
        )}
      </div>

      {/* Workout Details Modal */}
      {showDetailsModal && todaysWorkout && (
        <WorkoutDetailsModal
          workout={todaysWorkout}
          onClose={(): void => setShowDetailsModal(false)}
          onStartTraining={(): void => {
            setShowDetailsModal(false);
            handleStartTraining();
          }}
        />
      )}
      {/* Create Custom Plan Modal */}
      <CreateCustomPlanModal
        isOpen={isCustomPlanModalOpen}
        initialPlan={editingPlan}
        onClose={(): void => {
          setCustomPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSaveCustomPlan}
      />

      {/* Redirect to Onboarding Modal */}
      <RedirectToOnboardingModal
        isOpen={showRedirectModal}
        onClose={(): void => setShowRedirectModal(false)}
        redirectDelay={3}
      />
    </MainLayout>
  );
}
