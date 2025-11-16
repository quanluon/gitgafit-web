import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Play } from 'lucide-react';
import { Button } from '@atoms/Button';
import { WorkoutDay } from '@/types/workout';
import { Language } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';

interface WorkoutDetailsModalProps {
  workout: WorkoutDay;
  onClose: () => void;
  onStartTraining?: () => void;
}

export function WorkoutDetailsModal({
  workout,
  onClose,
  onStartTraining,
}: WorkoutDetailsModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

  const focus = workout.focus[currentLang];

  return (
    <div className="top-[-25px] fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{focus}</h2>
            <p className="text-sm text-muted-foreground">
              {workout.exercises.length} {t('workout.exercises')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Exercise List */}
        <div className="p-6 space-y-4">
          {workout.exercises.map((exercise, index) => {
            const exerciseName = exercise.name[currentLang];
            const exerciseDescription = exercise.description[currentLang];

            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                {/* Exercise Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-lg">{exerciseName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{exerciseDescription}</p>
                  </div>
                </div>

                {/* Sets & Reps */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="px-3 py-1.5 bg-secondary rounded-md">
                    <span className="font-semibold">{exercise.sets}</span> {t('workout.sets')}
                  </div>
                  <div className="px-3 py-1.5 bg-secondary rounded-md">
                    <span className="font-semibold">{exercise.reps}</span> {t('workout.reps')}
                  </div>
                </div>

                {/* Video Link */}
                {exercise.videoUrl && (
                  <a
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
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t p-6 space-y-3">
          {onStartTraining && (
            <Button className="w-full" size="lg" onClick={onStartTraining}>
              {t('workout.startTraining')}
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

