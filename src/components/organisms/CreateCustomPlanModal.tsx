import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { DayOfWeek } from '@/types/enums';
import { WorkoutDay, Exercise } from '@/types/workout';

interface CreateCustomPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: WorkoutDay[]) => Promise<void>;
}

export function CreateCustomPlanModal({
  isOpen,
  onClose,
  onSave,
}: CreateCustomPlanModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState<WorkoutDay[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const addDay = (): void => {
    setSchedule([
      ...schedule,
      {
        dayOfWeek: DayOfWeek.MONDAY,
        focus: { en: '', vi: '' },
        exercises: [],
      },
    ]);
  };

  const removeDay = (index: number): void => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateDay = (index: number, updates: Partial<WorkoutDay>): void => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], ...updates };
    setSchedule(updated);
  };

  const addExercise = (dayIndex: number): void => {
    const updated = [...schedule];
    updated[dayIndex].exercises.push({
      name: { en: '', vi: '' },
      description: { en: '', vi: '' },
      sets: 3,
      reps: '10',
      videoUrl: '',
    });
    setSchedule(updated);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number): void => {
    const updated = [...schedule];
    updated[dayIndex].exercises = updated[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setSchedule(updated);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, updates: Partial<Exercise>): void => {
    const updated = [...schedule];
    updated[dayIndex].exercises[exerciseIndex] = {
      ...updated[dayIndex].exercises[exerciseIndex],
      ...updates,
    };
    setSchedule(updated);
  };

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true);
      await onSave(schedule);
      onClose();
    } catch (error) {
      console.error('Failed to save custom plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getDayLabel = (day: DayOfWeek): string => {
    const dayMap: Record<DayOfWeek, string> = {
      [DayOfWeek.MONDAY]: t('common.days.monday'),
      [DayOfWeek.TUESDAY]: t('common.days.tuesday'),
      [DayOfWeek.WEDNESDAY]: t('common.days.wednesday'),
      [DayOfWeek.THURSDAY]: t('common.days.thursday'),
      [DayOfWeek.FRIDAY]: t('common.days.friday'),
      [DayOfWeek.SATURDAY]: t('common.days.saturday'),
      [DayOfWeek.SUNDAY]: t('common.days.sunday'),
    };
    return dayMap[day] || day;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{t('workout.createCustomPlan')}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {schedule.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('workout.noWorkoutDays')}</p>
              <p className="text-sm mt-2">{t('workout.clickAddDay')}</p>
            </div>
          )}

          {schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-card border rounded-lg p-4 space-y-4">
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-4">
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
                        {Object.values(DayOfWeek).map((d) => (
                          <SelectItem key={d} value={d}>
                            {getDayLabel(d)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('workout.focus')} ({t('common.lang.en')})</Label>
                      <Input
                        value={day.focus.en}
                        onChange={(e): void =>
                          updateDay(dayIndex, {
                            focus: { ...day.focus, en: e.target.value },
                          })
                        }
                        placeholder={t('workout.focusPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label>{t('workout.focus')} ({t('common.lang.vi')})</Label>
                      <Input
                        value={day.focus.vi}
                        onChange={(e): void =>
                          updateDay(dayIndex, {
                            focus: { ...day.focus, vi: e.target.value },
                          })
                        }
                        placeholder={t('workout.focusPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(): void => removeDay(dayIndex)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                {day.exercises.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-muted/30 border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {t('workout.exercise')} {exIndex + 1}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(): void => removeExercise(dayIndex, exIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">{t('workout.exerciseName')}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder={`${t('common.lang.en')}`}
                          value={exercise.name.en}
                          onChange={(e): void =>
                            updateExercise(dayIndex, exIndex, {
                              name: { ...exercise.name, en: e.target.value },
                            })
                          }
                        />
                        <Input
                          placeholder={`${t('common.lang.vi')}`}
                          value={exercise.name.vi}
                          onChange={(e): void =>
                            updateExercise(dayIndex, exIndex, {
                              name: { ...exercise.name, vi: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">{t('workout.description')}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder={`${t('common.lang.en')}`}
                          value={exercise.description?.en || ''}
                          onChange={(e): void =>
                            updateExercise(dayIndex, exIndex, {
                              description: { ...exercise.description, en: e.target.value },
                            })
                          }
                        />
                        <Input
                          placeholder={`${t('common.lang.vi')}`}
                          value={exercise.description?.vi || ''}
                          onChange={(e): void =>
                            updateExercise(dayIndex, exIndex, {
                              description: { ...exercise.description, vi: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder={t('workout.sets')}
                        value={exercise.sets}
                        onChange={(e): void =>
                          updateExercise(dayIndex, exIndex, {
                            sets: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                      <Input
                        placeholder={t('workout.reps')}
                        value={exercise.reps}
                        onChange={(e): void =>
                          updateExercise(dayIndex, exIndex, { reps: e.target.value })
                        }
                      />
                      <Input
                        placeholder={t('workout.videoUrl')}
                        value={exercise.videoUrl}
                        onChange={(e): void =>
                          updateExercise(dayIndex, exIndex, { videoUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(): void => addExercise(dayIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('workout.addExercise')}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-2">
          <Button variant="outline" onClick={addDay} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            {t('workout.addDay')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || schedule.length === 0} className="flex-1">
            {isSaving ? t('common.loading') : t('common.save')}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

