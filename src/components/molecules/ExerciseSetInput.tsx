import React from 'react';
import { Input } from '@atoms/Input';
import { Button } from '@atoms/Button';
import { Trash2 } from 'lucide-react';
import { ExerciseSet } from '@/types/workout';

interface ExerciseSetInputProps {
  set: ExerciseSet;
  setIndex: number;
  onUpdate: (field: 'reps' | 'weight', value: number) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export function ExerciseSetInput({
  set,
  setIndex,
  onUpdate,
  onRemove,
  canRemove,
}: ExerciseSetInputProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 bg-muted/30 rounded-md p-2">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs text-muted-foreground w-12">Set {setIndex + 1}</span>
        <Input
          type="number"
          value={set.reps}
          onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 0)}
          placeholder="Reps"
          className="h-8 text-xs placeholder:text-muted-foreground/40"
          min="0"
        />
        <span className="text-xs text-muted-foreground">x</span>
        <Input
          type="number"
          value={set.weight}
          onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
          placeholder="Weight (kg)"
          className="h-8 text-xs placeholder:text-muted-foreground/40"
          min="0"
          step="0.5"
        />
        <span className="text-xs text-muted-foreground">kg</span>
      </div>
      {canRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

