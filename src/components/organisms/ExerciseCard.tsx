import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { ExerciseLog } from '@/types/workout';
import { Language } from '@/types/enums';
import { ExerciseSetList } from '@molecules/ExerciseSetList';
import { ExerciseSet } from '@/types/workout';

interface ExerciseCardProps {
  exercise: ExerciseLog & {
    sessionDetails: Array<{ id: string; startTime: string; endTime?: string; duration?: number }>;
    sessionDurations: number[];
  };
  currentLang: Language;
  editableSets: ExerciseSet[];
  onUpdateSet: (setIndex: number, field: 'reps' | 'weight', value: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  formatTime: (date: string) => string;
  formatDuration: (minutes: number) => string;
  readOnly?: boolean;
}
export function ExerciseCard({
  exercise,
  currentLang,
  editableSets,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  formatTime,
  formatDuration,
  readOnly = false,
}: ExerciseCardProps): React.ReactElement {
  const { t } = useTranslation();
  const totalExerciseDuration = exercise.sessionDurations.reduce((sum, dur) => sum + dur, 0);
  const avgDurationPerSession =
    exercise.sessionDurations.length > 0
      ? Math.round(totalExerciseDuration / exercise.sessionDurations.length)
      : 0;

  return (
    <div className="bg-background border rounded-md p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm">{exercise.name[currentLang]}</p>
            {totalExerciseDuration > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDuration(totalExerciseDuration)}
                  {exercise.sessionDurations.length > 1 &&
                    ` (${formatDuration(avgDurationPerSession)}/${t('statistics.perSession')})`}
                </span>
              </div>
            )}
          </div>
          {exercise.description && (
            <p className="text-xs text-muted-foreground">{exercise.description[currentLang]}</p>
          )}
          {exercise.muscleGroup && (
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              {exercise.muscleGroup}
            </span>
          )}
          {exercise.sessionDetails.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-muted-foreground">
              {exercise.sessionDetails.map((sessionDetail, sIdx) => (
                <span key={sIdx} className="bg-muted/50 px-2 py-0.5 rounded">
                  {formatTime(sessionDetail.startTime)}
                  {sessionDetail.endTime && ` - ${formatTime(sessionDetail.endTime)}`}
                  {sessionDetail.duration && ` (${formatDuration(sessionDetail.duration)})`}
                </span>
              ))}
            </div>
          )}
        </div>
        {exercise.sets.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {exercise.sets.length} {t('statistics.sets')}
          </span>
        )}
      </div>

      <ExerciseSetList
        sets={readOnly ? exercise.sets : editableSets}
        onUpdate={onUpdateSet}
        onAdd={onAddSet}
        onRemove={onRemoveSet}
        readOnly={readOnly}
      />

      {exercise.notes && (
        <p className="text-xs text-muted-foreground italic">💭 {exercise.notes}</p>
      )}
    </div>
  );
}
