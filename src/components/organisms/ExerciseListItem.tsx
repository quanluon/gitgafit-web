import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Exercise } from '@/types/workout';
import { Language } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';

interface ExerciseListItemProps {
  exercise: Exercise;
  latestResults?: Array<{ reps: number; weight: number }>;
  onExerciseClick: () => void;
}

export function ExerciseListItem({
  exercise,
  latestResults = [],
  onExerciseClick,
}: ExerciseListItemProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

  const exerciseName = exercise.name[currentLang];

  return (
    <div
      className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onExerciseClick}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{exerciseName}</h3>
        <Button variant="ghost" size="icon" onClick={(e): void => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {latestResults.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">{t('workout.latestResult')}</p>
          <div className="flex gap-2 overflow-x-auto">
            {latestResults.map((result, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-[60px] px-3 py-2 bg-secondary rounded-lg"
              >
                <span className="text-xs text-muted-foreground">x{result.reps}</span>
                <span className="font-semibold">{result.weight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

