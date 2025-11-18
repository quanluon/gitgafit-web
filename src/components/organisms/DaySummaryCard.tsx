import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Dumbbell, TrendingUp } from 'lucide-react';
import { TrainingSession } from '@/types/workout';

interface DaySummaryCardProps {
  sessions: TrainingSession[];
  totalStats: { totalSets: number; totalVolume: number; totalDuration: number };
  formatTime: (date: string) => string;
  formatDuration: (minutes: number) => string;
}
export function DaySummaryCard({
  sessions,
  totalStats,
  formatTime,
  formatDuration,
}: DaySummaryCardProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="bg-muted/30 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <p className="font-semibold">
            {t('statistics.allWorkouts')} ({sessions.length}{' '}
            {sessions.length > 1 ? t('statistics.workouts') : t('statistics.workout')})
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {totalStats.totalDuration > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(totalStats.totalDuration)}</span>
            </div>
          )}
          {totalStats.totalVolume > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{totalStats.totalVolume.toLocaleString()}kg</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {sessions.map((session) => (
          <span key={session._id}>
            {formatTime(session.startTime)}
            {session.endTime && ` - ${formatTime(session.endTime)}`}
          </span>
        ))}
      </div>
    </div>
  );
}
