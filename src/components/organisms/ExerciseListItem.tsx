import { Language } from '@/types/enums';
import { Exercise } from '@/types/workout';
import { useLocaleStore } from '@store/localeStore';
import { Play } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

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

  const formatWeightLabel = (weight: number): string =>
    weight > 0 ? `${weight} kg` : t('training.bodyweightShort');

  return (
    <div
      className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onExerciseClick}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{exerciseName}</h3>
        {/* Video Link */}
        {exercise.videoUrl && (
          <a
            onClick={(e): void => e.stopPropagation()}
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Play className="h-4 w-4" />
            {t('workout.watchVideo')}
          </a>
        )}
      </div>

      {/* Target Sets */}
      <div className="flex items-center gap-4 text-sm">
        <div className="px-3 py-1.5 bg-secondary rounded-md">
          <span className="font-semibold">{exercise.sets}</span> {t('workout.sets')}
        </div>
        <div className="px-3 py-1.5 bg-secondary rounded-md">
          <span className="font-semibold">{exercise.reps}</span> {t('workout.reps')}
        </div>
      </div>

      {/* Logged Sets */}
      {latestResults.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">{t('training.loggedSets')}:</p>
          <div className="space-y-1">
            {latestResults.map((result, index) => (
              <div
                key={`${index}-${result.reps}-${result.weight}`}
                className="flex items-center justify-between p-2 bg-primary/5 rounded-md text-sm"
              >
                <span className="text-muted-foreground">Set {index + 1}:</span>
                <span className="font-semibold">
                  {result.reps} {t('workout.reps')}{' '}
                  {result.weight > 0 ? (
                    <>× {formatWeightLabel(result.weight)}</>
                  ) : (
                    <>• {t('training.bodyweightShort')}</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">{t('training.tapToLog')}</p>
        </div>
      )}
    </div>
  );
}
