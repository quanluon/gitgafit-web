import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface MacrosCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  title?: string;
}

export function MacrosCard({
  calories,
  protein,
  carbs,
  fat,
  title,
}: MacrosCardProps): React.ReactElement {
  const { t } = useTranslation();
  const displayTitle = title || t('meal.dailyTargets');

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4 overflow-scroll">
      <h3 className="font-semibold">{displayTitle}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{calories}</p>
            <p className="text-xs text-muted-foreground">{t('meal.calories')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Beef className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{protein}g</p>
            <p className="text-xs text-muted-foreground">{t('meal.protein')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Wheat className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{carbs}g</p>
            <p className="text-xs text-muted-foreground">{t('meal.carbs')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{fat}g</p>
            <p className="text-xs text-muted-foreground">{t('meal.fat')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

