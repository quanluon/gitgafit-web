import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar } from 'lucide-react';
import { Button } from '@atoms/Button';
import { TrainingSession, ExerciseLog, ExerciseSet } from '@/types/workout';
import { Language } from '@/types/enums';
import { ExerciseCard } from './ExerciseCard';
import { DaySummaryCard } from './DaySummaryCard';

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

  // State for editable sets per exercise
  const [editableSets, setEditableSets] = useState<Map<string, ExerciseSet[]>>(new Map());

  // Initialize editable sets from grouped exercises
  useEffect(() => {
    setEditableSets((prev) => {
      const updated = new Map(prev);
      groupedExercises.forEach((exercise) => {
        const exerciseId = exercise.name[currentLang] || exercise.exerciseId;
        if (!updated.has(exerciseId)) {
          const originalSets = exercise.sets || [];
          if (originalSets.length === 0) {
            updated.set(exerciseId, [{ reps: 10, weight: 0 }]);
          } else {
            const defaultReps = originalSets[0]?.reps || 10;
            const defaultWeight = originalSets[0]?.weight || 0;
            updated.set(exerciseId, [
              ...originalSets.map((s) => ({ ...s })),
              { reps: defaultReps, weight: defaultWeight },
            ]);
          }
        }
      });
      return updated;
    });
  }, [groupedExercises, currentLang]);

  const getEditableSets = (exerciseId: string): ExerciseSet[] => {
    return editableSets.get(exerciseId) || [{ reps: 10, weight: 0 }];
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number): void => {
    const currentSets = getEditableSets(exerciseId);
    const newSets = [...currentSets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    setEditableSets(new Map(editableSets.set(exerciseId, newSets)));
  };

  const addSet = (exerciseId: string): void => {
    const currentSets = getEditableSets(exerciseId);
    const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weight: 0 };
    setEditableSets(new Map(editableSets.set(exerciseId, [...currentSets, { ...lastSet }])));
  };

  const removeSet = (exerciseId: string, setIndex: number): void => {
    const currentSets = getEditableSets(exerciseId);
    if (currentSets.length > 1) {
      setEditableSets(
        new Map(editableSets.set(exerciseId, currentSets.filter((_, idx) => idx !== setIndex))),
      );
    }
  };

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
              <DaySummaryCard
                sessions={sessions}
                totalStats={totalStats}
                formatTime={formatTime}
                formatDuration={formatDuration}
              />

              {groupedExercises.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {t('statistics.exercises')} ({groupedExercises.length})
                  </h3>
                  {groupedExercises.map((exercise, idx) => {
                    const exerciseId = exercise.name[currentLang] || exercise.exerciseId;
                    return (
                      <ExerciseCard
                        key={idx}
                        exercise={exercise}
                        currentLang={currentLang}
                        editableSets={getEditableSets(exerciseId)}
                        onUpdateSet={(setIdx, field, value) => updateSet(exerciseId, setIdx, field, value)}
                        onAddSet={() => addSet(exerciseId)}
                        onRemoveSet={(setIdx) => removeSet(exerciseId, setIdx)}
                        formatTime={formatTime}
                        formatDuration={formatDuration}
                      />
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

