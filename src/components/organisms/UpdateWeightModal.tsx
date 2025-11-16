import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';

interface UpdateWeightModalProps {
  currentWeight: number;
  onSave: (weight: number, notes?: string) => void;
  onClose: () => void;
}

export function UpdateWeightModal({
  currentWeight,
  onSave,
  onClose,
}: UpdateWeightModalProps): React.ReactElement {
  const { t } = useTranslation();
  const [weight, setWeight] = useState<number>(currentWeight);
  const [notes, setNotes] = useState<string>('');

  const handleSave = (): void => {
    onSave(weight, notes || undefined);
    onClose();
  };

  return (
    <div className="top-[-25px] fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('weight.updateTitle')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">{t('workout.weight')}</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e): void => setWeight(parseFloat(e.target.value) || 0)}
              placeholder={t('weight.placeholder')}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('weight.notesOptional')}</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e): void => setNotes(e.target.value)}
              placeholder={t('weight.notesPlaceholder')}
            />
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleSave}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}

