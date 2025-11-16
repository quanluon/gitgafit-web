import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import { Button } from '@atoms/Button';
import { MainLayout } from '@templates/MainLayout';
import { inbodyService } from '@services/inbodyService';
import { InbodyResult, InbodyStatus, InbodyAnalysis, Translatable } from '@/types/inbody';
import { useNavigate } from 'react-router-dom';
import { AppRoutePath } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { useLocaleStore } from '@/store/localeStore';
import { InbodyAnalysisModal } from '@organisms/InbodyAnalysisModal';
import { Language } from '@/types/enums';
import { InBodyReportTab } from '@organisms/InBodyReportTab';
import { BodyPhotoTab } from '@organisms/BodyPhotoTab';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { GenerationType } from '@/store/generationStore';

type TabType = 'report' | 'photo';

export function InbodyPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { getQuotaInfo } = useSubscriptionStats();
  const { language } = useLocaleStore();
  const currentLang = language as Language;
  const [results, setResults] = useState<InbodyResult[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('report');
  const [selectedAnalysis, setSelectedAnalysis] = useState<Translatable | InbodyAnalysis | null>(null);
  const [selectedS3Url, setSelectedS3Url] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const inbodyQuota = getQuotaInfo(GenerationType.INBODY);
  const bodyPhotoQuota = getQuotaInfo(GenerationType.BODY_PHOTO);

  const loadResults = useMemo(
    () => async (): Promise<void> => {
      try {
        const data = await inbodyService.list(50, 0);
        setResults(data);
      } catch (error) {
        console.error('Failed to load InBody results', error);
        showError(t('inbody.loadError'));
      }
    },
    [t],
  );

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('inbody.title')}</h1>
            <p className="text-muted-foreground">{t('inbody.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={(): void => navigate(AppRoutePath.Planner)}>
            {t('navigation.planner')}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b mb-4">
          <button
            onClick={(): void => {
              if (!isAnalyzing) {
                setActiveTab('report');
              }
            }}
            disabled={isAnalyzing}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'report'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
              isAnalyzing && 'opacity-50 cursor-not-allowed',
            )}
          >
            {t('inbody.tabs.report')}
          </button>
          <button
            onClick={(): void => {
              if (!isAnalyzing) {
                setActiveTab('photo');
              }
            }}
            disabled={isAnalyzing}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'photo'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
              isAnalyzing && 'opacity-50 cursor-not-allowed',
            )}
          >
            {t('inbody.tabs.photo')}
          </button>
        </div>

        <div className="p-4 space-y-4 border rounded-lg bg-card relative">
          {isAnalyzing && (
            <div className="top-[-25px] fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-sm font-medium text-muted-foreground">
                  {t('inbody.bodyPhoto.analyzing')}
                </div>
              </div>
            </div>
          )}
          {/* Keep both tabs mounted to preserve state */}
          <div className={cn(activeTab !== 'report' && 'hidden')}>
            <InBodyReportTab quota={inbodyQuota} onRefresh={loadResults} />
          </div>
          <div className={cn(activeTab !== 'photo' && 'hidden')}>
            <BodyPhotoTab
              quota={bodyPhotoQuota}
              onRefresh={loadResults}
              onAnalyzingChange={setIsAnalyzing}
            />
          </div>
        </div>

        <div className="p-4 space-y-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('inbody.historyTitle')}</h2>
            <Button variant="ghost" size="sm" onClick={(): void => void loadResults()}>
              {t('common.refresh')}
            </Button>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('inbody.noResults')}</p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const statusStyles =
                  result.status === InbodyStatus.COMPLETED
                    ? 'bg-emerald-100 text-emerald-700'
                    : result.status === InbodyStatus.FAILED
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-blue-100 text-blue-700';

                const hasAnalysis =
                  result.aiAnalysis &&
                  typeof result.aiAnalysis === 'object' &&
                  !Array.isArray(result.aiAnalysis) &&
                  ('en' in (result.aiAnalysis as object) || 'vi' in (result.aiAnalysis as object));

                return (
                  <div
                    key={result._id}
                    className={cn(
                      'border rounded-lg p-4 space-y-3 transition-colors',
                      hasAnalysis && 'cursor-pointer hover:bg-muted/50',
                    )}
                    onClick={(e): void => {
                      e.stopPropagation();
                      if (hasAnalysis) {
                        setSelectedAnalysis(result.aiAnalysis as Translatable | InbodyAnalysis);
                        setSelectedS3Url(result?.s3Url || null);
                      }
                    }}
                    onKeyDown={(e): void => {
                      if ((e.key === 'Enter' || e.key === ' ') && hasAnalysis) {
                        e.preventDefault();
                        setSelectedAnalysis(result.aiAnalysis as Translatable | InbodyAnalysis);
                        setSelectedS3Url(result?.s3Url || null);
                      }
                    }}
                    role={hasAnalysis ? 'button' : undefined}
                    tabIndex={hasAnalysis ? 0 : undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {result.takenAt
                            ? dayjs(result.takenAt).format('DD MMM YYYY')
                            : t('inbody.unknownDate')}
                        </div>
                        {!!result.metrics?.bodyFatPercent && (
                          <div className="text-sm text-muted-foreground">
                            {t('inbody.bodyFatLabel', { value: result.metrics.bodyFatPercent })}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn('text-xs font-semibold px-2 py-1 rounded-full', statusStyles)}
                      >
                        {t(`inbody.status.${result.status}`)}
                      </span>
                    </div>
                    {hasAnalysis ? (
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-sm">
                        <div className="text-primary font-medium mb-1">
                          {t('inbody.clickToViewAnalysis')}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {((): string => {
                            const analysis = result.aiAnalysis;
                            if (!analysis) return '';
                            // Old format: Translatable (string)
                            if (
                              typeof analysis === 'object' &&
                              'en' in analysis &&
                              typeof analysis.en === 'string'
                            ) {
                              const translatable = analysis as Translatable;
                              const text =
                                translatable[currentLang] ||
                                translatable.vi ||
                                translatable.en ||
                                '';
                              return text.slice(0, 100) + (text.length > 100 ? '...' : '');
                            }
                              // New format: Structured object
                            if (
                              typeof analysis === 'object' &&
                              'en' in analysis &&
                              typeof analysis.en === 'object' &&
                              analysis.en !== null &&
                              'body_composition_summary' in analysis.en
                            ) {
                              const structured = analysis as InbodyAnalysis;
                              const summary =
                                structured[currentLang]?.body_composition_summary ||
                                structured.vi?.body_composition_summary ||
                                structured.en?.body_composition_summary ||
                                '';
                              return summary.slice(0, 100) + (summary.length > 100 ? '...' : '');
                            }
                            return '';
                          })()}
                        </div>
                      </div>
                    ) : result.status === InbodyStatus.COMPLETED ? (
                      <div className="bg-muted/30 border rounded-md p-3 text-sm text-muted-foreground">
                        {t('inbody.noAnalysis')}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analysis Modal */}
        {selectedAnalysis && (
          <InbodyAnalysisModal
            analysis={selectedAnalysis}
            s3Url={selectedS3Url}
            onClose={(): void => {
              setSelectedAnalysis(null);
              setSelectedS3Url(null);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
