import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@atoms/Button';
import { WorkoutDay } from '@/types/workout';
import { Language } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';

interface WorkoutCardProps {
  workout: WorkoutDay;
  onStartTraining: () => void;
  onManage?: () => void;
  onViewDetails?: () => void;
  disabled?: boolean;
}

export function WorkoutCard({
  workout,
  onStartTraining,
  onViewDetails,
  disabled = false,
}: WorkoutCardProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

  const focus = workout.focus[currentLang];
  const exerciseCount = workout.exercises.length;

  // Calculate estimated duration (assuming 5 minutes per exercise)
  const estimatedMinutes = exerciseCount * 5;
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  const duration = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm text-muted-foreground">{t('workout.todaysTraining')}</h3>
          <h2 className="text-2xl font-bold mt-1">{focus}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          0 of {exerciseCount} {t('workout.exercises')}
        </span>
        <span>•</span>
        <span>{duration}</span>
      </div>

      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full text-left p-3 rounded-lg border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('workout.viewDetails')}</span>
            <span className="text-xs text-muted-foreground">
              {exerciseCount} {t('workout.exercises')} →
            </span>
          </div>
        </button>
      )}
      <Button className="w-full" size="lg" onClick={onStartTraining} disabled={disabled}>
        {t('workout.startTraining')}
      </Button>
    </div>
  );
}
