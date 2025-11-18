import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@atoms/Button';
import { ExerciseSetInput } from './ExerciseSetInput';
import { ExerciseSet } from '@/types/workout';

interface ExerciseSetListProps {
  sets: ExerciseSet[];
  onUpdate: (setIndex: number, field: 'reps' | 'weight', value: number) => void;
  onAdd: () => void;
  onRemove: (setIndex: number) => void;
}

export function ExerciseSetList({
  sets,
  onUpdate,
  onAdd,
  onRemove,
}: ExerciseSetListProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground">
          {t('statistics.sets')}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onAdd}
        >
          <Plus className="h-3 w-3 mr-1" />
          {t('common.add') || 'Add'}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {sets.map((set, setIdx) => (
          <ExerciseSetInput
            key={setIdx}
            set={set}
            setIndex={setIdx}
            onUpdate={(field, value) => onUpdate(setIdx, field, value)}
            onRemove={sets.length > 1 ? () => onRemove(setIdx) : undefined}
            canRemove={sets.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

