import { useLocaleStore } from '@/store/localeStore';
import { TrainingRecommendation } from '@/types/user';
import { Button } from '@atoms/Button';
import { Activity, Flame, Target, TrendingUp, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TrainingRecommendationModalProps {
  recommendation: TrainingRecommendation;
  isOpen: boolean;
  onClose: () => void;
}

export function TrainingRecommendationModal({
  recommendation,
  isOpen,
  onClose,
}: TrainingRecommendationModalProps): React.ReactElement | null {
  const { t } = useTranslation();

  const { translate } = useLocaleStore();
  const localizedTitle = translate(recommendation.title);
  const localizedSummary = translate(recommendation.summary);
  const localizedCta = translate(recommendation.cta);

  if (!isOpen) return null;

  const formatMetric = (key: string, value: unknown): string => {
    // If value is already a formatted string, return it as-is
    if (typeof value === 'string') {
      return value;
    }
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'number' ? `${v}kg` : String(v))).join(', ');
    }
    // Handle objects
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      return Object.entries(obj)
        .map(([k, v]) => {
          if (typeof v === 'number') {
            if (k.includes('weight') || k.includes('mass')) return `${v}kg`;
            if (k.includes('percent')) return `${v}%`;
            return v.toString();
          }
          return `${k}: ${String(v)}`;
        })
        .join(', ');
    }
    // Handle numbers
    if (typeof value === 'number') {
      if (key.includes('weight')) {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}kg`;
      }
      if (key.includes('calories')) {
        return `${value.toLocaleString()}`;
      }
      if (key.includes('percent')) {
        return `${value.toFixed(1)}%`;
      }
      return value.toString();
    }
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? t('common.yes') : t('common.no');
    }
    return String(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{localizedTitle}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {localizedSummary && (
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {localizedSummary}
              </p>
            </div>
          )}

          {recommendation.metrics && Object.keys(recommendation.metrics).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{t('home.recommendation.metrics')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(recommendation.metrics)
                  .filter(([_, value]) => value !== null && value !== undefined)
                  .map(([key, value]) => {
                    let icon = <Activity className="h-4 w-4" />;
                    if (key.includes('weight')) icon = <TrendingUp className="h-4 w-4" />;
                    if (key.includes('calories')) icon = <Flame className="h-4 w-4" />;
                    if (key.includes('sessions')) icon = <Target className="h-4 w-4" />;

                    const metricLabel = t(`home.recommendation.metric.${key}`, {
                      defaultValue: key,
                      fallbackLng: 'en',
                    });

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                      >
                        <div className="text-primary">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground truncate">{metricLabel}</p>
                          <p className="font-semibold text-sm break-words">
                            {formatMetric(key, value)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {localizedCta && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">{localizedCta}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>{t('common.close')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
