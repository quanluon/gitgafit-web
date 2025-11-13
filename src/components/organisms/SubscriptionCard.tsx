import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Zap, Check, TrendingUp } from 'lucide-react';
import { subscriptionService } from '@services/subscriptionService';
import { SubscriptionStats, SubscriptionPlan } from '@/types/subscription';

export function SubscriptionCard(): React.ReactElement {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load subscription stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="bg-card border rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  const planConfig = {
    [SubscriptionPlan.FREE]: {
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: t('subscription.freePlan'),
    },
    [SubscriptionPlan.PREMIUM]: {
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      label: t('subscription.premiumPlan'),
    },
    [SubscriptionPlan.ENTERPRISE]: {
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      label: t('subscription.enterprisePlan'),
    },
  };

  const config = planConfig[stats.plan] || planConfig[SubscriptionPlan.FREE];
  const Icon = config.icon;

  const getProgressColor = (remaining: number, limit: number): string => {
    if (limit === -1) return 'bg-green-500';
    const percentage = (remaining / limit) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const nextReset = new Date(date);
    nextReset.setDate(nextReset.getDate() + 30);
    return nextReset.toLocaleDateString();
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`${config.bgColor} p-4 border-b`}>
        <div className="flex items-center gap-3">
          <div className={`${config.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{config.label}</h3>
            <p className="text-xs text-muted-foreground">
              {t('subscription.resetsOn')}: {formatDate(stats.periodStart)}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-4 space-y-4">
        {/* Workout Generations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t('subscription.workoutGenerations')}</span>
            <span className="text-muted-foreground">
              {stats.workout.limit === -1
                ? t('subscription.unlimited')
                : `${stats.workout.remaining} ${t('subscription.remaining')}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(stats.workout.remaining, stats.workout.limit)} transition-all`}
                style={{
                  width:
                    stats.workout.limit === -1
                      ? '100%'
                      : `${((stats.workout.limit - stats.workout.used) / stats.workout.limit) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground text-right">
              {stats.workout.limit === -1
                ? '∞'
                : `${stats.workout.used}/${stats.workout.limit}`}
            </span>
          </div>
        </div>

        {/* Meal Generations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t('subscription.mealGenerations')}</span>
            <span className="text-muted-foreground">
              {stats.meal.limit === -1
                ? t('subscription.unlimited')
                : `${stats.meal.remaining} ${t('subscription.remaining')}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(stats.meal.remaining, stats.meal.limit)} transition-all`}
                style={{
                  width:
                    stats.meal.limit === -1
                      ? '100%'
                      : `${((stats.meal.limit - stats.meal.used) / stats.meal.limit) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground text-right">
              {stats.meal.limit === -1 ? '∞' : `${stats.meal.used}/${stats.meal.limit}`}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Section (only for non-enterprise) */}
      {stats.plan !== SubscriptionPlan.ENTERPRISE && (
        <div className="border-t bg-muted/30 p-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('subscription.wantMore')}</p>
            <div className="grid gap-2">
              {stats.plan === SubscriptionPlan.FREE && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('subscription.premiumBenefit1')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('subscription.premiumBenefit2')}
                    </span>
                  </div>
                </>
              )}
              {stats.plan === SubscriptionPlan.PREMIUM && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('subscription.enterpriseBenefit1')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('subscription.enterpriseBenefit2')}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="pt-2">
              <button
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                onClick={(): void => {
                  // TODO: Navigate to upgrade page or show upgrade modal
                  alert(t('subscription.comingSoon'));
                }}
              >
                {stats.plan === SubscriptionPlan.FREE
                  ? t('subscription.upgradeToPremium')
                  : t('subscription.upgradeToEnterprise')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Badge */}
      {stats.plan === SubscriptionPlan.ENTERPRISE && (
        <div className="border-t bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 text-center">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {t('subscription.enterpriseActive')} ✨
          </p>
        </div>
      )}
    </div>
  );
}


