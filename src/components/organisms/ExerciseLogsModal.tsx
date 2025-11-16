import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock, Dumbbell, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@atoms/Button';
import { TrainingSession } from '@/types/workout';
import { Language } from '@/types/enums';

interface ExerciseLogsModalProps {
  sessions: TrainingSession[];
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseLogsModal({
  sessions,
  date,
  isOpen,
  onClose,
}: ExerciseLogsModalProps): React.ReactElement | null {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;

  if (!isOpen) return null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="top-[-25px] fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{t('statistics.trainingLogs')}</h2>
            <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('statistics.noWorkoutsThisDay')}</p>
            </div>
          )}

          {sessions.map((session) => (
            <div key={session._id} className="bg-muted/30 border rounded-lg p-4 space-y-3">
              {/* Session Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {session.workoutFocus
                        ? session.workoutFocus[currentLang]
                        : t('workout.workout')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(session.startTime)}
                      {session.endTime && ` - ${formatTime(session.endTime)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {session.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                  )}
                  {session.totalVolume && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{session.totalVolume.toLocaleString()}kg</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercises */}
              {session.exercises && session.exercises.length > 0 && (
                <div className="space-y-2 pl-7">
                  {session.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="bg-background border rounded-md p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {exercise.name[currentLang]}
                          </p>
                          {exercise.description && (
                            <p className="text-xs text-muted-foreground">
                              {exercise.description[currentLang]}
                            </p>
                          )}
                          {exercise.muscleGroup && (
                            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {exercise.muscleGroup}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sets */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {exercise.sets.map((set: { reps: number; weight: number }, setIdx: number) => (
                          <div
                            key={setIdx}
                            className="bg-muted/50 rounded px-2 py-1 text-center"
                          >
                            <span className="font-medium">{set.reps}</span>
                            <span className="text-muted-foreground"> x </span>
                            <span className="font-medium">{set.weight}kg</span>
                          </div>
                        ))}
                      </div>

                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          💭 {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Session Notes */}
              {session.notes && (
                <div className="text-xs text-muted-foreground italic pl-7">
                  💭 {session.notes}
                </div>
              )}

              {/* Stats Summary */}
              {(session.totalSets || session.totalVolume) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t pl-7">
                  {session.totalSets && (
                    <span>
                      {t('statistics.totalSets')}: <strong>{session.totalSets}</strong>
                    </span>
                  )}
                  {session.totalVolume && (
                    <span>
                      {t('statistics.totalVolume')}: <strong>{session.totalVolume.toLocaleString()}kg</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <Button onClick={onClose} className="w-full">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

