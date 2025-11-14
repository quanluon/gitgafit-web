import React from 'react';
import { Trophy } from 'lucide-react';
import { Award } from '@/types/analytics';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '@store/localeStore';

interface AwardCardProps {
  award: Award;
  color?: string;
}

const colorClasses: Record<string, string> = {
  green: 'bg-green-500 text-white',
  pink: 'bg-pink-500 text-white',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  orange: 'bg-orange-500 text-white',
};

export function AwardCard({ award, color = 'green' }: AwardCardProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const bgClass = colorClasses[color] || colorClasses.green;

  const formattedDate = new Date(award.date).toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`${bgClass} rounded-lg p-6 min-w-[280px] space-y-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <h3 className="font-semibold">{award.exerciseName}</h3>
        </div>
        <span className="text-sm opacity-90">{formattedDate}</span>
      </div>

      <div>
        <div className="text-5xl font-bold">
          {award.value} {t('workout.weightUnit', 'kg')}
        </div>
      </div>

      <div className="text-sm opacity-90">
        {t('statistics.awardPercentile', { percentile: award.percentile })}
      </div>
    </div>
  );
}

