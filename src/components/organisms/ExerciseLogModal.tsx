import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Exercise } from '@/types/workout';
import { Language } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';

interface ExerciseSet {
  reps: number;
  weight: number;
}

interface ExerciseLogModalProps {
  exercise: Exercise;
  existingSets?: ExerciseSet[];
  onSave: (sets: ExerciseSet[]) => void;
  onClose: () => void;
}

export function ExerciseLogModal({
  exercise,
  existingSets = [],
  onSave,
  onClose,
}: ExerciseLogModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

  // Initialize with existing sets or create empty sets based on exercise definition
  const initializeSets = (): ExerciseSet[] => {
    if (existingSets.length > 0) {
      return existingSets;
    }
    // Create sets based on exercise definition
    return Array(exercise.sets || 3)
      .fill(null)
      .map(() => ({ reps: 0, weight: 0 }));
  };

  const [sets, setSets] = useState<ExerciseSet[]>(initializeSets());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const exerciseName = exercise.name[currentLang];
  const exerciseDescription = exercise.description[currentLang];

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: string): void => {
    const newSets = [...sets];
    const numValue = field === 'weight' ? parseFloat(value) : parseInt(value);
    newSets[index] = {
      ...newSets[index],
      [field]: isNaN(numValue) ? 0 : numValue,
    };
    setSets(newSets);

    // Clear error for this field
    const errorKey = `${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleAddSet = (): void => {
    // Copy the last set's data or use defaults
    const lastSet = sets[sets.length - 1] || { reps: 0, weight: 0 };
    setSets([...sets, { ...lastSet }]);
  };

  const handleRemoveSet = (index: number): void => {
    if (sets.length <= 1) return; // Keep at least one set
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const validateSets = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    sets.forEach((set, index) => {
      if (set.reps <= 0) {
        newErrors[`${index}-reps`] = 'Reps must be greater than 0';
        isValid = false;
      }
      if (set.weight < 0) {
        newErrors[`${index}-weight`] = 'Weight cannot be negative';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = (): void => {
    if (!validateSets()) {
      return;
    }

    // Filter out empty sets
    const validSets = sets.filter((set) => set.reps > 0);
    if (validSets.length === 0) {
      setErrors({ general: 'Please log at least one set' });
      return;
    }

    onSave(validSets);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{exerciseName}</h2>
            <p className="text-sm text-muted-foreground">{exerciseDescription}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {exercise.sets} {t('workout.sets')} × {exercise.reps} {t('workout.reps')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          {/* Sets List */}
          <div className="space-y-3">
            {sets.map((set, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    Set {index + 1}
                    {index < exercise.sets && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Target: {exercise.reps} {t('workout.reps')})
                      </span>
                    )}
                  </h3>
                  {sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(): void => handleRemoveSet(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Reps Input */}
                  <div className="space-y-1">
                    <Label htmlFor={`reps-${index}`} className="text-sm">
                      Reps <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`reps-${index}`}
                      type="number"
                      value={set.reps || ''}
                      onChange={(e): void => handleSetChange(index, 'reps', e.target.value)}
                      placeholder="8"
                      className={`text-lg ${errors[`${index}-reps`] ? 'border-destructive focus:border-destructive' : ''}`}
                    />
                    {errors[`${index}-reps`] && (
                      <p className="text-xs text-destructive font-medium">{errors[`${index}-reps`]}</p>
                    )}
                  </div>

                  {/* Weight Input */}
                  <div className="space-y-1">
                    <Label htmlFor={`weight-${index}`} className="text-sm">
                      Weight (kg) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`weight-${index}`}
                      type="number"
                      step="0.5"
                      value={set.weight || ''}
                      onChange={(e): void => handleSetChange(index, 'weight', e.target.value)}
                      placeholder="0"
                      className={`text-lg ${errors[`${index}-weight`] ? 'border-destructive focus:border-destructive' : ''}`}
                    />
                    {errors[`${index}-weight`] && (
                      <p className="text-xs text-destructive font-medium">{errors[`${index}-weight`]}</p>
                    )}
                  </div>
                </div>

                {/* Set Summary */}
                {set.reps > 0 && set.weight > 0 && (
                  <div className="text-sm text-center p-2 bg-primary/10 rounded-md">
                    <span className="font-semibold">
                      {set.reps} reps × {set.weight} kg
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Set Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddSet}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('workout.addSet')}
          </Button>

          {/* Logged Sets Summary */}
          {sets.filter((s) => s.reps > 0).length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">{t('training.summary')}:</h4>
              <div className="space-y-1 text-sm">
                {sets.map((set, index) =>
                  set.reps > 0 ? (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground">Set {index + 1}:</span>
                      <span className="font-medium">
                        {set.reps} reps × {set.weight} kg
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button className="w-full" size="lg" onClick={handleSave}>
            {t('workout.saveLog')}
          </Button>
        </div>
      </div>
    </div>
  );
}
