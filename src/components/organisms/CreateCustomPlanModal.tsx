import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { DayOfWeek, Language, MuscleGroup } from '@/types/enums';
import { Exercise, WorkoutDay, WorkoutPlan, CustomPlanPayload } from '@/types/workout';
import { ExerciseCatalogItem } from '@/types/exercise';
import { useExerciseCatalog } from '@hooks/useExerciseCatalog';

interface CreateCustomPlanModalProps {
  isOpen: boolean;
  initialPlan?: WorkoutPlan | null;
  onClose: () => void;
  onSave: (payload: CustomPlanPayload) => Promise<void>;
}
const getEmptyExercise = (): Exercise => ({
  name: { en: '', vi: '' },
  description: { en: '', vi: '' },
  sets: 3,
  reps: '10',
  videoUrl: '',
});

const cloneSchedule = (schedule: WorkoutDay[]): WorkoutDay[] =>
  schedule.map((day) => ({
    ...day,
    focus: { ...day.focus },
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      name: { ...exercise.name },
      description: exercise.description ? { ...exercise.description } : { en: '', vi: '' },
    })),
  }));

export function CreateCustomPlanModal({
  isOpen,
  initialPlan,
  onClose,
  onSave,
}: CreateCustomPlanModalProps): React.ReactElement | null {
  const { t, i18n } = useTranslation();
  const language = (i18n.language as Language) || Language.EN;
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState<WorkoutDay[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLibraryDay, setActiveLibraryDay] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialPlan?.title ?? '');
      setSchedule(initialPlan?.schedule ? cloneSchedule(initialPlan.schedule) : []);
      setActiveLibraryDay(null);
    }
  }, [initialPlan, isOpen]);

  const dayOptions = Object.values(DayOfWeek);

  const availableDay = dayOptions.find((day) => !schedule.some((d) => d.dayOfWeek === day));

  const addDay = (): void => {
    setSchedule((prev) => [
      ...prev,
      {
        dayOfWeek: availableDay || DayOfWeek.MONDAY,
        focus: { en: '', vi: '' },
        exercises: [getEmptyExercise()],
      },
    ]);
  };

  const removeDay = (index: number): void => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
    if (activeLibraryDay === index) {
      setActiveLibraryDay(null);
    }
  };

  const updateDay = (index: number, updates: Partial<WorkoutDay>): void => {
    setSchedule((prev) => {
      const draft = cloneSchedule(prev);
      draft[index] = { ...draft[index], ...updates };
      return draft;
    });
  };

  const addManualExercise = (dayIndex: number): void => {
    setSchedule((prev) => {
      const draft = cloneSchedule(prev);
      draft[dayIndex].exercises.push(getEmptyExercise());
      return draft;
    });
  };

  const addExerciseFromLibrary = (dayIndex: number, exercise: ExerciseCatalogItem): void => {
    setSchedule((prev) => {
      const draft = cloneSchedule(prev);
      draft[dayIndex].exercises.push({
        exerciseId: exercise._id,
        name: exercise.name,
        description: {
          en: exercise.metadata?.description || '',
          vi: exercise.metadata?.description || '',
        },
        sets: 3,
        reps: '10',
        videoUrl: exercise.videoUrl,
      });
      return draft;
    });
    showSuccess(
      t('workout.libraryAdded', { exercise: exercise.name[language] || exercise.name.en }),
    );
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number): void => {
    setSchedule((prev) => {
      const draft = cloneSchedule(prev);
      draft[dayIndex].exercises = draft[dayIndex].exercises.filter(
        (_, idx) => idx !== exerciseIndex,
      );
      if (draft[dayIndex].exercises.length === 0) {
        draft[dayIndex].exercises.push(getEmptyExercise());
      }
      return draft;
    });
  };

  const moveExercise = (dayIndex: number, exerciseIndex: number, direction: -1 | 1): void => {
    setSchedule((prev) => {
      const draft = cloneSchedule(prev);
      const target = exerciseIndex + direction;
      if (target < 0 || target >= draft[dayIndex].exercises.length) {
        return prev;
      }
      const exercises = draft[dayIndex].exercises;
      [exercises[exerciseIndex], exercises[target]] = [exercises[target], exercises[exerciseIndex]];
      return draft;
    });
  };

  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    updates: Partial<Exercise>,
  ): void => {
    setSchedule((prev) => {
      const draft = cloneSchedule(prev);
      const current = draft[dayIndex].exercises[exerciseIndex];
      draft[dayIndex].exercises[exerciseIndex] = {
        ...current,
        ...updates,
        name: updates.name ? { ...updates.name } : current.name,
        description:
          updates.description !== undefined
            ? { ...updates.description }
            : (current.description ?? { en: '', vi: '' }),
      };
      return draft;
    });
  };

  const getDayLabel = (day: DayOfWeek): string => {
    const map: Record<DayOfWeek, string> = {
      [DayOfWeek.MONDAY]: t('common.days.monday'),
      [DayOfWeek.TUESDAY]: t('common.days.tuesday'),
      [DayOfWeek.WEDNESDAY]: t('common.days.wednesday'),
      [DayOfWeek.THURSDAY]: t('common.days.thursday'),
      [DayOfWeek.FRIDAY]: t('common.days.friday'),
      [DayOfWeek.SATURDAY]: t('common.days.saturday'),
      [DayOfWeek.SUNDAY]: t('common.days.sunday'),
    };
    return map[day] || day;
  };

  const validationMessage = useMemo(() => {
    if (schedule.length === 0) {
      return t('workout.validation.addDay');
    }
    for (const day of schedule) {
      if (!day.focus.en.trim()) {
        return t('workout.validation.focusEn');
      }
      if (!day.focus.vi.trim()) {
        return t('workout.validation.focusVi');
      }
      if (!day.exercises.length) {
        return t('workout.validation.exerciseRequired');
      }
      for (const exercise of day.exercises) {
        if (!exercise.name.en.trim()) {
          return t('workout.validation.exerciseName');
        }
        if (exercise.sets <= 0) {
          return t('workout.validation.exerciseSets');
        }
        if (!exercise.reps.trim()) {
          return t('workout.validation.exerciseReps');
        }
      }
    }
    return null;
  }, [schedule, t]);

  if (!isOpen) return null;

  const handleSave = async (): Promise<void> => {
    if (validationMessage) {
      showError(validationMessage);
      return;
    }
    try {
      setIsSaving(true);
      await onSave({
        title,
        schedule,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save custom plan:', error);
      showError(t('workout.failedToCreatePlan'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container border w-full max-w-5xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">{t('workout.createCustomPlan')}</h2>
            <p className="text-sm text-muted-foreground">{t('workout.customPlanDescription')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label>{t('workout.planTitle')}</Label>
            <Input
              value={title}
              onChange={(event): void => setTitle(event.target.value)}
              placeholder={t('workout.planTitlePlaceholder') || ''}
            />
          </div>

          {schedule.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <p>{t('workout.noWorkoutDays')}</p>
              <p className="text-sm">{t('workout.clickAddDay')}</p>
            </div>
          )}
          {schedule.map((day, dayIndex) => (
            <div key={`${day.dayOfWeek}-${dayIndex}`} className="space-y-4 rounded-lg border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                    <div>
                      <Label>{t('workout.day')}</Label>
                      <Select
                        value={day.dayOfWeek}
                        onValueChange={(value): void =>
                          updateDay(dayIndex, { dayOfWeek: value as DayOfWeek })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {getDayLabel(option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label>
                          {t('workout.focus')} ({t('common.lang.en')})
                        </Label>
                        <Input
                          value={day.focus.en}
                          onChange={(event): void =>
                            updateDay(dayIndex, {
                              focus: { ...day.focus, en: event.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>
                          {t('workout.focus')} ({t('common.lang.vi')})
                        </Label>
                        <Input
                          value={day.focus.vi}
                          onChange={(event): void =>
                            updateDay(dayIndex, {
                              focus: { ...day.focus, vi: event.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={(): void => setActiveLibraryDay(dayIndex)}
                  >
                    {t('workout.browseLibrary')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-start sm:self-auto"
                    onClick={(): void => removeDay(dayIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="rounded-md border bg-muted/20 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>
                          {t('workout.exercise')} {exerciseIndex + 1}
                        </span>
                        {exercise.exerciseId && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {t('workout.libraryTag')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(): void => moveExercise(dayIndex, exerciseIndex, -1)}
                          disabled={exerciseIndex === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(): void => moveExercise(dayIndex, exerciseIndex, 1)}
                          disabled={exerciseIndex === day.exercises.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(): void => removeExercise(dayIndex, exerciseIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <Label className="text-xs">{t('workout.exerciseName')} (EN)</Label>
                        <Input
                          value={exercise.name.en}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, {
                              name: { ...exercise.name, en: event.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('workout.exerciseName')} (VI)</Label>
                        <Input
                          value={exercise.name.vi}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, {
                              name: { ...exercise.name, vi: event.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <Label className="text-xs">{t('workout.description')} (EN)</Label>
                        <Input
                          value={exercise.description?.en || ''}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, {
                              description: { ...exercise.description, en: event.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('workout.description')} (VI)</Label>
                        <Input
                          value={exercise.description?.vi || ''}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, {
                              description: { ...exercise.description, vi: event.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <Label className="text-xs">{t('workout.sets')}</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, {
                              sets: parseInt(event.target.value, 10) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('workout.reps')}</Label>
                        <Input
                          value={exercise.reps}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, { reps: event.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('workout.videoUrl')}</Label>
                        <Input
                          value={exercise.videoUrl}
                          onChange={(event): void =>
                            updateExercise(dayIndex, exerciseIndex, {
                              videoUrl: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(): void => addManualExercise(dayIndex)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('workout.addExercise')}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t bg-muted/30 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Button variant="outline" onClick={addDay} className="md:flex-1">
              <Plus className="mr-2 h-4 w-4" />
              {t('workout.addDay')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || Boolean(validationMessage)}
              className="md:flex-1"
            >
              {isSaving ? t('common.loading') : t('common.save')}
            </Button>
            <Button variant="ghost" onClick={onClose} className="md:flex-1">
              {t('common.cancel')}
            </Button>
          </div>
          {validationMessage && (
            <p className="mt-2 text-sm text-destructive">{validationMessage}</p>
          )}
        </div>

        {activeLibraryDay !== null && schedule[activeLibraryDay] && (
          <ExerciseLibraryPanel
            dayLabel={getDayLabel(schedule[activeLibraryDay].dayOfWeek)}
            onClose={(): void => setActiveLibraryDay(null)}
            onSelect={(exercise): void => addExerciseFromLibrary(activeLibraryDay, exercise)}
          />
        )}
      </div>
    </div>
  );
}
interface ExerciseLibraryPanelProps {
  dayLabel: string;
  onClose: () => void;
  onSelect: (exercise: ExerciseCatalogItem) => void;
}
function ExerciseLibraryPanel({
  dayLabel,
  onClose,
  onSelect,
}: ExerciseLibraryPanelProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const language = (i18n.language as Language) || Language.EN;
  const { exercises, isLoading, error, search } = useExerciseCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'all'>('all');

  useEffect(() => {
    void search({ limit: 15 });
  }, [search]);

  const handleSearch = (): void => {
    void search({
      search: searchTerm || undefined,
      muscleGroup: selectedGroup === 'all' ? undefined : selectedGroup,
      limit: 15,
    });
  };

  if (typeof document === 'undefined') {
    return <></>;
  }
  return createPortal(
    <div className="modal-overlay z-[70] items-stretch justify-end p-0">
      <div className="ml-auto flex h-full w-full max-w-lg flex-col bg-card px-6 py-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              {t('workout.exerciseLibraryForDay', { day: dayLabel })}
            </h3>
            <p className="text-sm text-muted-foreground">{t('workout.libraryHint')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder={t('workout.searchExercises') || ''}
            value={searchTerm}
            onChange={(event): void => setSearchTerm(event.target.value)}
          />
          <Select
            value={selectedGroup}
            onValueChange={(value): void => setSelectedGroup(value as MuscleGroup | 'all')}
          >
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder={t('workout.muscleGroup')} />
            </SelectTrigger>
            <SelectContent className="z-[80]">
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {Object.values(MuscleGroup).map((group) => (
                <SelectItem key={group} value={group}>
                  {t(`muscles.${group}`, group)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={isLoading}>
            {t('common.search')}
          </Button>
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </div>
          )}
          {!isLoading && error && <p className="text-destructive text-sm">{error}</p>}
          {!isLoading && !error && exercises.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('workout.exerciseLibraryEmpty')}</p>
          )}
          {exercises.map((exercise) => (
            <div
              key={exercise._id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                <div>
                  <p className="font-medium">{exercise.name[language] || exercise.name.en}</p>
                  {exercise.metadata?.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 text-ellipsis">
                      {exercise.metadata.description}
                    </p>
                  )}
                </div>
              </a>
              <Button size="sm" onClick={(): void => onSelect(exercise)}>
                <Plus />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
