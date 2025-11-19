import { AppRoutePath } from '@/routes/paths';
import { Award, WeightHistory } from '@/types/analytics';
import { DayOfWeek } from '@/types/enums';
import { Button } from '@atoms/Button';
import { AwardCard } from '@organisms/AwardCard';
import { TrainingRecommendationModal } from '@organisms/TrainingRecommendationModal';
import { UpdateWeightModal } from '@organisms/UpdateWeightModal';
import { WeightChart } from '@organisms/WeightChart';
import { WorkoutCard } from '@organisms/WorkoutCard';
import { WorkoutDetailsModal } from '@organisms/WorkoutDetailsModal';
import { analyticsService } from '@services/analyticsService';
import { trainingService } from '@services/trainingService';
import { userService } from '@services/userService';
import { workoutService } from '@services/workoutService';
import { useAuthStore } from '@store/authStore';
import { useLocaleStore } from '@store/localeStore';
import { useTrainingStore } from '@store/trainingStore';
import { useWorkoutStore } from '@store/workoutStore';
import { MainLayout } from '@templates/MainLayout';
import { CalendarDays, TrendingUp, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function HomePage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { translate } = useLocaleStore();
  const { setCurrentPlan, setTodaysWorkout, todaysWorkout } = useWorkoutStore();
  const { currentSession, setCurrentSession } = useTrainingStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState<boolean>(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState<boolean>(false);
  const trainingRecommendation = user?.trainingRecommendation;
  const recommendationTitle = translate(trainingRecommendation?.title);

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
    navigate(AppRoutePath.Planner);
  };

  return (
    <MainLayout>
      <div className="p-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">{t('home.appName')}</h1>
            <p className="text-muted-foreground">
              {t('home.welcome')}, {user?.email.split('@')[0]}!
            </p>
          </div>

          {/* Training Recommendation */}
          {!isLoading && trainingRecommendation && (
            <button
              onClick={(): void => setShowRecommendationModal(true)}
              className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{recommendationTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('home.recommendation.clickToView')}
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={(): void => navigate(AppRoutePath.Planner)}
              className="flex flex-col items-center gap-2 p-4 bg-card border rounded-lg hover:bg-accent transition-colors"
            >
              <CalendarDays className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{t('home.workouts')}</span>
            </button>
            <button
              onClick={(): void => navigate(AppRoutePath.MealPlanner)}
              className="flex flex-col items-center gap-2 p-4 bg-card border rounded-lg hover:bg-accent transition-colors"
            >
              <Utensils className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{t('home.meals')}</span>
            </button>
            <button
              onClick={(): void => navigate(AppRoutePath.Statistics)}
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
                  <p className="text-sm text-muted-foreground">{t('training.ongoingSession')}</p>
                </div>
                <Button onClick={(): void => navigate(AppRoutePath.Training)}>
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
                <p className="text-sm text-muted-foreground mt-2">{t('training.completeFirst')}</p>
              )}
            </div>
          )}
          {!isLoading && !todaysWorkout && (
            <div className="bg-card border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">{t('workout.noWorkoutToday')}</p>
              <Button className="mt-4" onClick={(): void => navigate(AppRoutePath.Planner)}>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(): void => navigate(AppRoutePath.Statistics)}
                >
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
            navigate(AppRoutePath.Planner);
          }}
        />
      )}
      {/* Training Recommendation Modal */}
      {showRecommendationModal && trainingRecommendation && (
        <TrainingRecommendationModal
          recommendation={trainingRecommendation}
          isOpen={showRecommendationModal}
          onClose={(): void => setShowRecommendationModal(false)}
        />
      )}
    </MainLayout>
  );
}
