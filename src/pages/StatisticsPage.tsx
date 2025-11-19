import { StatisticsSkeleton } from '@/components/molecules';
import { Award, ProgressStats, WeightHistory } from '@/types/analytics';
import { TrainingSession } from '@/types/workout';
import { Button } from '@atoms/Button';
import { StatCard } from '@molecules/StatCard';
import { AwardCard } from '@organisms/AwardCard';
import { ExerciseLogsModal } from '@organisms/ExerciseLogsModal';
import { TrainingCalendar } from '@organisms/TrainingCalendar';
import { UpdateWeightModal } from '@organisms/UpdateWeightModal';
import { WeightChart } from '@organisms/WeightChart';
import { analyticsService } from '@services/analyticsService';
import { userService } from '@services/userService';
import { useAuthStore } from '@store/authStore';
import { MainLayout } from '@templates/MainLayout';
import { Activity, Calendar, Clock, Flame } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function StatisticsPage(): React.ReactElement {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSessions, setSelectedSessions] = useState<TrainingSession[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [history, stats, userAwards] = await Promise.all([
        analyticsService.getWeightHistory(90),
        analyticsService.getProgressStats(),
        analyticsService.getTopAwards(5),
      ]);
      setWeightHistory(history);
      setProgressStats(stats);
      setAwards(userAwards);
    } catch (err) {
      console.error('Failed to load analytics:', err);
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
      loadAnalytics();
    } catch (err) {
      console.error('Failed to update weight:', err);
    }
  };

  const handleDayClick = (date: Date, sessions: TrainingSession[]): void => {
    setSelectedDate(date);
    setSelectedSessions(sessions);
    setShowLogsModal(true);
  };

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 
      ? `${hours}${t('common.time.hours')} ${minutes}${t('common.time.minutes')}`
      : `${minutes}${t('common.time.minutes')}`;
  };

  const awardColors = ['green', 'pink', 'blue', 'purple', 'orange'];

  if (isLoading) {
    return (
      <MainLayout>
        <StatisticsSkeleton/>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b stickyyy top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('navigation.statistics')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Progress Stats */}
        {progressStats && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title={t('statistics.totalWorkouts')}
              value={progressStats.completedSessions}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatCard
              title={t('statistics.currentStreak')}
              value={`${progressStats.currentStreak} ${t('statistics.perSession')}`}
              icon={<Flame className="h-4 w-4" />}
            />
            <StatCard
              title={t('statistics.totalTime')}
              value={formatDuration(progressStats.totalWorkoutTime)}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              title={t('statistics.avgDuration')}
              value={formatDuration(progressStats.averageWorkoutDuration)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        )}
        {/* Weight Chart */}
        <WeightChart
          data={weightHistory}
          currentWeight={user?.weight || 0}
          targetWeight={user?.targetWeight}
          onUpdate={(): void => setShowWeightModal(true)}
        />

        {/* Training Calendar */}
        <div>
          <h2 className="text-xl font-bold mb-4">{t('statistics.trainingHistory')}</h2>
          <TrainingCalendar onDayClick={handleDayClick} />
        </div>

        {/* Awards */}
        {awards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('statistics.awards')}</h2>
              <Button variant="ghost" size="sm">
                {t('common.all')}
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {awards.map((award, index) => (
                <AwardCard
                  key={award._id}
                  award={award}
                  color={awardColors[index % awardColors.length]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Update Weight Modal */}
      {showWeightModal && (
        <UpdateWeightModal
          currentWeight={user?.weight || 0}
          onSave={handleUpdateWeight}
          onClose={(): void => setShowWeightModal(false)}
        />
      )}
      {/* Exercise Logs Modal */}
      <ExerciseLogsModal
        sessions={selectedSessions}
        date={selectedDate}
        isOpen={showLogsModal}
        onClose={(): void => setShowLogsModal(false)}
        readOnly={true}
      />
    </MainLayout>
  );
}
