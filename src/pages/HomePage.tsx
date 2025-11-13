import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Utensils, TrendingUp } from 'lucide-react';
import { Button } from '@atoms/Button';
import { WorkoutCard } from '@organisms/WorkoutCard';
import { WeightChart } from '@organisms/WeightChart';
import { AwardCard } from '@organisms/AwardCard';
import { UpdateWeightModal } from '@organisms/UpdateWeightModal';
import { WorkoutDetailsModal } from '@organisms/WorkoutDetailsModal';
import { MainLayout } from '@templates/MainLayout';
import { useAuthStore } from '@store/authStore';
import { useWorkoutStore } from '@store/workoutStore';
import { useTrainingStore } from '@store/trainingStore';
import { workoutService } from '@services/workoutService';
import { analyticsService } from '@services/analyticsService';
import { userService } from '@services/userService';
import { trainingService } from '@services/trainingService';
import { DayOfWeek } from '@/types/enums';
import { WeightHistory, Award } from '@/types/analytics';

export function HomePage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { setCurrentPlan, setTodaysWorkout, todaysWorkout } = useWorkoutStore();
  const { currentSession, setCurrentSession } = useTrainingStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState<boolean>(false);

  // Get current day
  const getCurrentDay = (): DayOfWeek => {
    const today = new Date();
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    return Object.values(DayOfWeek)[dayIndex];
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [plan, history, topAwards, activeSession] = await Promise.all([
        workoutService.getCurrentPlan(),
        analyticsService.getWeightHistory(90),
        analyticsService.getTopAwards(3),
        trainingService.getActiveSession(),
      ]);

      setCurrentPlan(plan);
      const currentDay = getCurrentDay();
      const workout = plan.schedule.find((w) => w.dayOfWeek === currentDay);
      setTodaysWorkout(workout || null);

      setWeightHistory(history);
      setAwards(topAwards);
      setCurrentSession(activeSession);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWeight = async (weight: number, notes?: string): Promise<void> => {
    try {
      await analyticsService.logWeight({ weight, notes });
      await userService.updateProfile({ weight } as never);
      const updatedUser = await userService.getProfile();
      updateUser(updatedUser);
      loadData();
    } catch (err) {
      console.error('Failed to update weight:', err);
    }
  };

  const handleStartTraining = async (): Promise<void> => {
    if (!todaysWorkout) return;
    navigate('/planner');
  };

  return (
    <MainLayout>
      <div className="p-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">{t('home.appName')}</h1>
            <p className="text-muted-foreground">{t('home.welcome')}, {user?.email.split('@')[0]}!</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={(): void => navigate('/planner')}
              className="flex flex-col items-center gap-2 p-4 bg-card border rounded-lg hover:bg-accent transition-colors"
            >
              <CalendarDays className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{t('home.workouts')}</span>
            </button>
            <button
              onClick={(): void => navigate('/meal-planner')}
              className="flex flex-col items-center gap-2 p-4 bg-card border rounded-lg hover:bg-accent transition-colors"
            >
              <Utensils className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{t('home.meals')}</span>
            </button>
            <button
              onClick={(): void => navigate('/statistics')}
              className="flex flex-col items-center gap-2 p-4 bg-card border rounded-lg hover:bg-accent transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{t('home.progress')}</span>
            </button>
          </div>

          {/* Active Training Session Alert */}
          {!isLoading && currentSession && (
            <div className="bg-primary/10 border border-primary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t('training.activeSession')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('training.ongoingSession')}
                  </p>
                </div>
                <Button onClick={(): void => navigate('/training')}>
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Today's Workout */}
          {!isLoading && todaysWorkout && (
            <div>
              <h2 className="text-lg font-semibold mb-3">{t('home.todaysTraining')}</h2>
              <WorkoutCard 
                workout={todaysWorkout} 
                onStartTraining={handleStartTraining}
                onViewDetails={(): void => setShowWorkoutDetails(true)}
                disabled={!!currentSession}
              />
              {currentSession && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('training.completeFirst')}
                </p>
              )}
            </div>
          )}

          {!isLoading && !todaysWorkout && (
            <div className="bg-card border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">{t('workout.noWorkoutToday')}</p>
              <Button className="mt-4" onClick={(): void => navigate('/planner')}>
                {t('workout.viewPlanner')}
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="bg-card border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          )}

          {/* Weight Tracking */}
          {!isLoading && user?.weight && (
            <div>
              <h2 className="text-lg font-semibold mb-3">{t('home.weightProgress')}</h2>
              <WeightChart
                data={weightHistory}
                currentWeight={user.weight}
                targetWeight={user.targetWeight}
                onUpdate={(): void => setShowWeightModal(true)}
              />
            </div>
          )}

          {/* Awards */}
          {!isLoading && awards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{t('home.awards')}</h2>
                <Button variant="ghost" size="sm" onClick={(): void => navigate('/statistics')}>
                  {t('home.all')}
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {awards.map((award, index) => (
                  <AwardCard
                    key={award._id}
                    award={award}
                    color={['green', 'pink', 'blue'][index % 3]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Weight Modal */}
      {showWeightModal && (
        <UpdateWeightModal
          currentWeight={user?.weight || 0}
          onSave={handleUpdateWeight}
          onClose={(): void => setShowWeightModal(false)}
        />
      )}

      {/* Workout Details Modal */}
      {showWorkoutDetails && todaysWorkout && (
        <WorkoutDetailsModal
          workout={todaysWorkout}
          onClose={(): void => setShowWorkoutDetails(false)}
          onStartTraining={(): void => {
            setShowWorkoutDetails(false);
            navigate('/planner');
          }}
        />
      )}
    </MainLayout>
  );
}

