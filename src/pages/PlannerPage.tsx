import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@atoms/Button';
import { DaySelector } from '@molecules/DaySelector';
import { WorkoutCard } from '@organisms/WorkoutCard';
import { WorkoutDetailsModal } from '@organisms/WorkoutDetailsModal';
import { CreateCustomPlanModal } from '@organisms/CreateCustomPlanModal';
import { MainLayout } from '@templates/MainLayout';
import { useWorkoutStore } from '@store/workoutStore';
import { useTrainingStore } from '@store/trainingStore';
import { workoutService } from '@services/workoutService';
import { trainingService } from '@services/trainingService';
import { userService } from '@services/userService';
import { DayOfWeek } from '@/types/enums';
import { WorkoutDay } from '@/types/workout';
import { SubscriptionStats } from '@/types/subscription';
import toast from 'react-hot-toast';

export function PlannerPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentPlan, setCurrentPlan, setTodaysWorkout } = useWorkoutStore();
  const { currentSession, setCurrentSession } = useTrainingStore();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [todaysWorkout, setTodaysWorkoutLocal] = useState<WorkoutDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showCustomPlanModal, setShowCustomPlanModal] = useState<boolean>(false);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);

  // Get current day
  const getCurrentDay = (): DayOfWeek => {
    const today = new Date();
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    return Object.values(DayOfWeek)[dayIndex];
  };

  useEffect(() => {
    loadWorkoutPlan();
    loadSubscriptionStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDay && currentPlan) {
      const workout = currentPlan.schedule.find((w) => w.dayOfWeek === selectedDay);
      setTodaysWorkoutLocal(workout || null);
      setTodaysWorkout(workout || null);
    }
  }, [selectedDay, currentPlan, setTodaysWorkout]);

  const loadSubscriptionStats = async (): Promise<void> => {
    try {
      const stats = await userService.getSubscriptionStats();
      setSubscriptionStats(stats);
    } catch (error) {
      console.error('Failed to load subscription stats:', error);
    }
  };

  const loadWorkoutPlan = async (): Promise<void> => {
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
      setError(t('workout.noPlanFound'));
      setTimeout(() => navigate('/onboarding'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

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
      navigate('/training');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || t('training.failedToStart'));
    }
  };

  const handleCreateCustomPlan = async (schedule: WorkoutDay[]): Promise<void> => {
    try {
      const plan = await workoutService.createCustomPlan({ schedule });
      setCurrentPlan(plan);
      toast.success(t('workout.customPlanCreated'));
      setShowCustomPlanModal(false);
      // Refresh page to show new plan
      loadWorkoutPlan();
    } catch (error) {
      console.error('Failed to create custom plan:', error);
      toast.error(t('workout.failedToCreatePlan'));
    }
  };

  const availableDays = currentPlan?.schedule.map((w) => w.dayOfWeek) || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t('workout.planner')}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(): void => setShowCustomPlanModal(true)}
                disabled
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('workout.createCustom')}
              </Button>
              <div className="flex flex-col items-end gap-1">
                {subscriptionStats && (
                  <div className="text-xs text-muted-foreground">
                    {subscriptionStats.workout.remaining} / {subscriptionStats.workout.limit === -1 ? '∞' : subscriptionStats.workout.limit}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(): void => navigate('/onboarding')}
                  disabled={subscriptionStats !== null && subscriptionStats.workout.remaining <= 0}
                >
                  <RefreshCw className={`h-4 w-4 mr-2`} />
                  {t('common.regenerate')}
                </Button>
              </div>
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
              <Button onClick={(): void => navigate('/training')}>
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
            onManage={(): void => navigate('/profile')}
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
        isOpen={showCustomPlanModal}
        onClose={(): void => setShowCustomPlanModal(false)}
        onSave={handleCreateCustomPlan}
      />
    </MainLayout>
  );
}
