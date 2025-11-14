import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@atoms/Button';
import { ExerciseListItem } from '@organisms/ExerciseListItem';
import { ExerciseLogModal } from '@organisms/ExerciseLogModal';
import { useWorkoutStore } from '@store/workoutStore';
import { useTrainingStore } from '@store/trainingStore';
import { trainingService } from '@services/trainingService';
import { indexedDBService } from '@services/indexeddb';
import { Exercise } from '@/types/workout';
import { Language } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';
import toast from 'react-hot-toast';

interface ExerciseSet {
  reps: number;
  weight: number;
}

interface ExerciseProgress {
  [exerciseIndex: string]: ExerciseSet[];
}

interface ExerciseWithIndex extends Exercise {
  index: number;
}

export function TrainingPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLocaleStore();
  const { todaysWorkout } = useWorkoutStore();
  const { currentSession, clearSession } = useTrainingStore();

  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress>({});
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithIndex | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  useEffect(() => {
    if (!currentSession || !todaysWorkout) {
      navigate('/planner');
    }
  }, [currentSession, todaysWorkout, navigate]);

  useEffect(() => {
    // Save to IndexedDB whenever progress changes
    if (currentSession && todaysWorkout) {
      indexedDBService.saveTrainingSession({
        ...currentSession,
        exercises: Object.entries(exerciseProgress).map(([exerciseId, sets]) => {
          const exerciseIndex = parseInt(exerciseId.replace('exercise_', ''), 10);
          const exercise = todaysWorkout.exercises[exerciseIndex];
          return {
            exerciseId,
            name: exercise?.name || { en: 'Unknown', vi: 'Không xác định' },
            description: exercise?.description,
            muscleGroup: undefined,
            sets,
            notes: undefined,
            videoUrl: exercise?.videoUrl,
          };
        }),
      });
    }
  }, [exerciseProgress, currentSession, todaysWorkout]);

  if (!todaysWorkout || !currentSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No active training session</p>
      </div>
    );
  }

  const currentLang = language as Language;
  const workoutFocus = todaysWorkout.focus[currentLang];

  const handleExerciseClick = (exercise: Exercise, index: number): void => {
    setSelectedExercise({ ...exercise, index });
  };

  const handleSaveSets = async (sets: ExerciseSet[]): Promise<void> => {
    if (selectedExercise === null) {
      console.error('No exercise selected');
      return;
    }

    if (!currentSession?._id) {
      console.error('No active session');
      return;
    }

    const exerciseKey = `exercise_${selectedExercise.index}`;
    const updatedProgress = {
      ...exerciseProgress,
      [exerciseKey]: sets,
    };

    setExerciseProgress(updatedProgress);

    const logData = {
      exercises: Object.entries(updatedProgress).map(([exerciseKey, exerciseSets]) => {
        const exerciseIndex = parseInt(exerciseKey.replace('exercise_', ''), 10);
        const exercise = todaysWorkout?.exercises[exerciseIndex];

        return {
          exerciseId: exerciseKey,
          name: exercise?.name || { en: 'Unknown', vi: 'Không xác định' },
          description: exercise?.description,
          // muscleGroup: undefined,
          sets: exerciseSets,
          // notes: undefined,
          videoUrl: exercise?.videoUrl,
        };
      }),
    };

    try {
      // Update session on backend
      await trainingService.logExercise(currentSession._id, logData);
      setSelectedExercise(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || t('training.failedToLog') || 'Failed to log exercise. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCompleteSession = async (): Promise<void> => {
    if (!currentSession) return;

    try {
      setIsCompleting(true);
      await trainingService.completeSession(currentSession._id);
      await indexedDBService.deleteTrainingSession(currentSession._id);
      clearSession();
      navigate('/');
    } catch (err) {
      console.error('Failed to complete session:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelSession = async (): Promise<void> => {
    if (!currentSession) return;

    if (confirm('Are you sure you want to cancel this session?')) {
      try {
        await trainingService.cancelSession(currentSession._id);
        await indexedDBService.deleteTrainingSession(currentSession._id);
        clearSession();
        navigate('/planner');
      } catch (err) {
        console.error('Failed to cancel session:', err);
      }
    }
  };

  const completedExercises = Object.keys(exerciseProgress).filter(
    (id) => exerciseProgress[id].length > 0,
  ).length;
  const totalExercises = todaysWorkout.exercises.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={(): void => navigate('/planner')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{workoutFocus}</h1>
                <p className="text-sm text-muted-foreground">
                  {completedExercises} of {totalExercises} {t('workout.exercises')}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancelSession}>
              {t('workout.cancelSession')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Exercise List */}
        {todaysWorkout.exercises.map((exercise, index) => {
          const exerciseKey = `exercise_${index}`;
          return (
            <ExerciseListItem
              key={exerciseKey}
              exercise={exercise}
              latestResults={exerciseProgress[exerciseKey] || []}
              onExerciseClick={(): void => handleExerciseClick(exercise, index)}
            />
          );
        })}

        {/* Complete Button */}
        <div className="pt-4 space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCompleteSession}
            disabled={isCompleting || completedExercises === 0}
          >
            {isCompleting ? t('common.loading') : t('workout.completeSession')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {completedExercises === 0
              ? t('training.logAtLeastOne')
              : t('training.completeAnytime')}
          </p>
        </div>
      </div>

      {/* Exercise Log Modal */}
      {selectedExercise && (
        <ExerciseLogModal
          exercise={selectedExercise}
          existingSets={exerciseProgress[`exercise_${selectedExercise.index}`] || []}
          onSave={handleSaveSets}
          onClose={(): void => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

