import { useCallback, useEffect, useMemo, useState } from 'react';
import { userService } from '@services/userService';
import { GenerationStats, SubscriptionStats } from '@/types/subscription';

type UseSubscriptionStatsOptions = {
  loadOnMount?: boolean;
};

type GenerationTypeKey = keyof SubscriptionStats;

type QuotaInfo = GenerationStats & {
  isUnlimited: boolean;
  isDepleted: boolean;
  limitLabel: string;
  formatted: string;
};

type UseSubscriptionStatsResult = {
  stats: SubscriptionStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<SubscriptionStats | null>;
  getQuotaInfo: (type: GenerationTypeKey) => QuotaInfo | null;
  formatQuotaDisplay: (type: GenerationTypeKey) => string | null;
};

export function useSubscriptionStats(
  options: UseSubscriptionStatsOptions = {},
): UseSubscriptionStatsResult {
  const { loadOnMount = true } = options;
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(loadOnMount);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<SubscriptionStats | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getSubscriptionStats();
      setStats(response);
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load subscription stats';
      setError(message);
      console.error('useSubscriptionStats:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getQuotaInfo = useCallback(
    (type: GenerationTypeKey): QuotaInfo | null => {
      if (!stats) return null;
      const { remaining, limit, resetsOn, used } = stats[type] as GenerationStats;
      const isUnlimited = limit === -1;
      const limitLabel = isUnlimited ? '∞' : String(limit);
      return {
        used,
        remaining,
        limit,
        resetsOn,
        isUnlimited,
        isDepleted: remaining <= 0,
        limitLabel,
        formatted: `${remaining} / ${limitLabel}`,
      };
    },
    [stats],
  );

  const formatQuotaDisplay = useCallback(
    (type: GenerationTypeKey): string | null => getQuotaInfo(type)?.formatted ?? null,
    [getQuotaInfo],
  );

  useEffect(() => {
    if (loadOnMount) {
      void refresh();
    } else {
      setIsLoading(false);
    }
  }, [loadOnMount, refresh]);

  return useMemo(
    () => ({
      stats,
      isLoading,
      error,
      refresh,
      getQuotaInfo,
      formatQuotaDisplay,
    }),
    [stats, isLoading, error, refresh, getQuotaInfo, formatQuotaDisplay],
  );
}


