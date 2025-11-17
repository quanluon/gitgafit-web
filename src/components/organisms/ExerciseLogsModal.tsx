import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock, Dumbbell, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@atoms/Button';
import { TrainingSession, ExerciseLog } from '@/types/workout';
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

  // Group all exercises from all sessions by exercise ID
  const groupedExercises = useMemo(() => {
    const exerciseMap = new Map<string, ExerciseLog & { 
      sessionIds: string[]; 
      sessionTimes: string[]; 
      sessionDurations: number[];
      sessionDetails: Array<{ id: string; startTime: string; endTime?: string; duration?: number }>;
    }>();
    
    sessions.forEach((session) => {
      session.exercises?.forEach((exercise) => {
        const exerciseId = exercise.name[currentLang] || exercise.exerciseId; 
        const existing = exerciseMap.get(exerciseId);
        if (existing) {
          // Merge sets from this session into existing exercise
          existing.sets = [...existing.sets, ...exercise.sets];
          existing.sessionIds.push(session._id);
          existing.sessionTimes.push(session.startTime);
          existing.sessionDurations.push(session.duration || 0);
          existing.sessionDetails.push({
            id: session._id,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
          });
          // Merge notes if any
          if (exercise.notes && !existing.notes?.includes(exercise.notes)) {
            existing.notes = existing.notes 
              ? `${existing.notes}\n${exercise.notes}`
              : exercise.notes;
          }
        } else {
          // First occurrence of this exercise
          exerciseMap.set(exerciseId, {
            ...exercise,
            sessionIds: [session._id],
            sessionTimes: [session.startTime],
            sessionDurations: [session.duration || 0],
            sessionDetails: [{
              id: session._id,
              startTime: session.startTime,
              endTime: session.endTime,
              duration: session.duration,
            }],
          });
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [sessions, currentLang]);

  // Calculate total stats for the day
  const totalStats = useMemo(() => {
    let totalSets = 0;
    let totalVolume = 0;
    let totalDuration = 0;
    
    sessions.forEach((session) => {
      totalSets += session.totalSets || 0;
      totalVolume += session.totalVolume || 0;
      totalDuration += session.duration || 0;
    });
    
    return { totalSets, totalVolume, totalDuration };
  }, [sessions]);

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
    <div className="modal-overlay">
      <div className="modal-container border max-w-2xl w-full flex flex-col">
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

          {sessions.length > 0 && (
            <>
              {/* Day Summary */}
              <div className="bg-muted/30 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <p className="font-semibold">
                      {t('statistics.allWorkouts')} ({sessions.length} {sessions.length > 1 ? t('statistics.workouts') : t('statistics.workout')})
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
                
                {/* Session Times */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {sessions.map((session) => (
                    <span key={session._id}>
                      {formatTime(session.startTime)}
                      {session.endTime && ` - ${formatTime(session.endTime)}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* All Exercises Grouped */}
              {groupedExercises.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {t('statistics.exercises')} ({groupedExercises.length})
                  </h3>
                  {groupedExercises.map((exercise, idx) => {
                    // Calculate total duration for this exercise across all sessions
                    const totalExerciseDuration = exercise.sessionDurations.reduce((sum, dur) => sum + dur, 0);
                    // Calculate average duration per session (if exercise appears in multiple sessions)
                    const avgDurationPerSession = exercise.sessionDurations.length > 0 
                      ? Math.round(totalExerciseDuration / exercise.sessionDurations.length)
                      : 0;
                    
                    return (
                      <div
                        key={idx}
                        className="bg-background border rounded-md p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">
                                {exercise.name[currentLang]}
                              </p>
                              {totalExerciseDuration > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDuration(totalExerciseDuration)}
                                    {exercise.sessionDurations.length > 1 && ` (${formatDuration(avgDurationPerSession)}/${t('statistics.perSession')})`}
                                  </span>
                                </div>
                              )}
                            </div>
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
                            {/* Session times for this exercise */}
                            {exercise.sessionDetails.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-muted-foreground">
                                {exercise.sessionDetails.map((sessionDetail, sIdx) => (
                                  <span 
                                    key={sIdx}
                                    className="bg-muted/50 px-2 py-0.5 rounded"
                                  >
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

                      {/* Sets */}
                      {exercise.sets.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-xs">
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
                      )}

                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            💭 {exercise.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Day Summary Stats */}
              {(totalStats.totalSets > 0 || totalStats.totalVolume > 0) && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-4 text-sm">
                    {totalStats.totalSets > 0 && (
                      <span>
                        {t('statistics.totalSets')}: <strong className="text-primary">{totalStats.totalSets}</strong>
                      </span>
                    )}
                    {totalStats.totalVolume > 0 && (
                      <span>
                        {t('statistics.totalVolume')}: <strong className="text-primary">{totalStats.totalVolume.toLocaleString()}kg</strong>
                      </span>
                    )}
                    {totalStats.totalDuration > 0 && (
                      <span>
                        {t('statistics.totalTime')}: <strong className="text-primary">{formatDuration(totalStats.totalDuration)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
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

