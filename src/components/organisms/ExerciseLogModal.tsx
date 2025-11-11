import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
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
  setNumber: number;
  existingSets?: ExerciseSet[];
  onSave: (sets: ExerciseSet[]) => void;
  onClose: () => void;
}

export function ExerciseLogModal({
  exercise,
  setNumber,
  existingSets = [],
  onSave,
  onClose,
}: ExerciseLogModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

  const [currentSet, setCurrentSet] = useState<ExerciseSet>(
    existingSets[setNumber - 1] || { reps: 8, weight: 0 },
  );

  const exerciseName = exercise.name[currentLang];

  const handleSave = (): void => {
    const updatedSets = [...existingSets];
    updatedSets[setNumber - 1] = currentSet;
    onSave(updatedSets);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {exerciseName}, Set {setNumber}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              value={currentSet.reps}
              onChange={(e): void =>
                setCurrentSet({ ...currentSet, reps: parseInt(e.target.value) || 0 })
              }
              placeholder="8"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={currentSet.weight}
              onChange={(e): void =>
                setCurrentSet({ ...currentSet, weight: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              className="text-lg"
            />
          </div>
        </div>

        {/* Previous Set Reference */}
        {setNumber > 1 && existingSets[setNumber - 2] && (
          <div className="p-3 bg-secondary rounded-lg text-sm">
            <p className="text-muted-foreground">Previous set:</p>
            <p className="font-semibold">
              {existingSets[setNumber - 2].reps} reps × {existingSets[setNumber - 2].weight} kg
            </p>
          </div>
        )}

        {/* Actions */}
        <Button className="w-full" size="lg" onClick={handleSave}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}

