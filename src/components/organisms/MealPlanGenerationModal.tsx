import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@atoms/Button';
import { Label } from '@atoms/Label';
import { X } from 'lucide-react';

interface MealPlanGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  isGenerating?: boolean;
}
export function MealPlanGenerationModal({
  isOpen,
  onClose,
  onConfirm,
  isGenerating = false,
}: MealPlanGenerationModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = async (): Promise<void> => {
    await onConfirm(notes.trim());
    setNotes(''); // Reset notes after confirmation
  };

  const handleClose = (): void => {
    if (!isGenerating) {
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container border p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('meal.generateMealPlan')}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isGenerating}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Notes Input */}
        <div className="space-y-2">
          <Label>{t('meal.notesLabel')}</Label>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            value={notes}
            onChange={(event): void => setNotes(event.target.value)}
            placeholder={t('meal.notesPlaceholder') || ''}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">{t('meal.notesHelper')}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isGenerating}
          >
            {isGenerating
              ? t('generation.generating') || 'Generating...'
              : t('common.generate') || 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  );
}
