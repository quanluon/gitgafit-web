import { SubscriptionPlan, SubscriptionStats } from '@/types/subscription';
import { subscriptionService } from '@services/subscriptionService';
import { Crown, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';

export function SubscriptionCard(): React.ReactElement {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      <div className="bg-card border rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/2"></div>
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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const nextReset = new Date(date);
    nextReset.setDate(nextReset.getDate() + 30);
    return nextReset.toLocaleDateString();
  };

  return (
    <>
      <button
        onClick={(): void => setShowModal(true)}
        className="w-full bg-card border rounded-lg p-4 hover:bg-accent transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{config.label}</h3>
              <p className="text-xs text-muted-foreground">
                {t('subscription.resetsOn')}: {formatDate(stats.periodStart)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      <SubscriptionDetailsModal
        isOpen={showModal}
        stats={stats}
        onClose={(): void => setShowModal(false)}
      />
    </>
  );
}
