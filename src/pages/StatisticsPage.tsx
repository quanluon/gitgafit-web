import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, Calendar, Clock, Flame } from 'lucide-react';
import { Button } from '@atoms/Button';
import { StatCard } from '@molecules/StatCard';
import { WeightChart } from '@organisms/WeightChart';
import { AwardCard } from '@organisms/AwardCard';
import { UpdateWeightModal } from '@organisms/UpdateWeightModal';
import { MainLayout } from '@templates/MainLayout';
import { useAuthStore } from '@store/authStore';
import { analyticsService } from '@services/analyticsService';
import { userService } from '@services/userService';
import { WeightHistory, ProgressStats, Award } from '@/types/analytics';

export function StatisticsPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);

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

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const awardColors = ['green', 'pink', 'blue', 'purple', 'orange'];

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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={(): void => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{t('navigation.statistics')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Progress Stats */}
        {progressStats && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Workouts"
              value={progressStats.completedSessions}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatCard
              title="Current Streak"
              value={`${progressStats.currentStreak} days`}
              icon={<Flame className="h-4 w-4" />}
            />
            <StatCard
              title="Total Time"
              value={formatDuration(progressStats.totalWorkoutTime)}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              title="Avg Duration"
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

        {/* Awards */}
        {awards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Awards</h2>
              <Button variant="ghost" size="sm">
                All
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
    </MainLayout>
  );
}

