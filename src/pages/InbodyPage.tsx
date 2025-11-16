import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Webcam from 'react-webcam';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { MainLayout } from '@templates/MainLayout';
import { inbodyService } from '@services/inbodyService';
import { InbodyResult, InbodyStatus, InbodyMetricsSummary } from '@/types/inbody';
import { Translatable } from '@/types/common';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { useNavigate } from 'react-router-dom';
import { AppRoutePath } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { GenerationType } from '@/store/generationStore';
import { useLocaleStore } from '@/store/localeStore';
import { InbodyAnalysisModal } from '@organisms/InbodyAnalysisModal';
import { Language } from '@/types/enums';
import { validateImage, ValidationResult } from '@/utils/imageValidation';
import { Camera, X, Check, AlertCircle } from 'lucide-react';

export function InbodyPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getQuotaInfo, refresh } = useSubscriptionStats();
  const { language } = useLocaleStore();
  const currentLang = language as Language;
  const [results, setResults] = useState<InbodyResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState<Date>(() => new Date());
  const [ocrText, setOcrText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<InbodyMetricsSummary | undefined>();
  const [s3Url, setS3Url] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<Translatable | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);

  const inbodyQuota = getQuotaInfo(GenerationType.INBODY);

  const loadResults = useMemo(
    () => async (): Promise<void> => {
      try {
        const data = await inbodyService.list(50, 0);
        setResults(data);
      } catch (error) {
        console.error('Failed to load InBody results', error);
        toast.error(t('inbody.loadError'));
      }
    },
    [t],
  );

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = async (fileToValidate: File): Promise<void> => {
    try {
      setIsValidating(true);
      const validation = await validateImage(fileToValidate);
      setValidationResult(validation);

      if (validation.isValid) {
        setFile(fileToValidate);
        setOcrText('');
        setShowPreview(false);
        setMetrics(undefined);
        setS3Url('');
        toast.success(t('inbody.imageValid'));
      } else {
        const errorMessages = validation.errorKeys.map((key: string) => t(key)).join('. ');
        toast.error(errorMessages || t('inbody.imageInvalid'), { duration: 5000 });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(t('inbody.validationError'));
    } finally {
      setIsValidating(false);
    }
  };

  const capturePhoto = (): void => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error(t('inbody.captureError'));
      return;
    }

    // Convert base64 to File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `inbody-${Date.now()}.jpg`, { type: 'image/jpeg' });
        void validateAndSetFile(file);
        setShowCamera(false);
      })
      .catch((error) => {
        console.error('Capture error:', error);
        toast.error(t('inbody.captureError'));
      });
  };

  const handleScan = async (): Promise<void> => {
    if (!file) {
      toast.error(t('inbody.fileRequired'));
      return;
    }

    try {
      setIsScanning(true);
      // Reset preview state when rescanning
      if (showPreview) {
        setShowPreview(false);
        setOcrText('');
        setMetrics(undefined);
      }

      // Upload to S3 first
      const { uploadUrl, s3Url: url } = await inbodyService.getPresignedUrl(file.name);
      await inbodyService.uploadToS3(uploadUrl, file);
      setS3Url(url);

      // Scan image using AI vision
      const result = await inbodyService.scanImage(
        url,
        file.name,
        takenAt ? dayjs(takenAt).toISOString() : undefined,
      );

      setOcrText(result.ocrText || '');
      setMetrics(result.metrics);
      setShowPreview(true);
      toast.success(t('inbody.scanSuccess'));
      await refresh();
    } catch (error) {
      console.error('Scan failed', error);
      toast.error(t('inbody.scanError'));
    } finally {
      setIsScanning(false);
    }
  };

  const handleProcess = async (): Promise<void> => {
    if (!file || !ocrText.trim()) {
      toast.error(t('inbody.ocrTextRequired'));
      return;
    }
    if (inbodyQuota?.isDepleted) {
      toast.error(t('subscription.limitReached'));
      return;
    }

    try {
      setIsLoading(true);

      // If S3 URL not available, upload first
      let finalS3Url = s3Url;
      if (!finalS3Url) {
        const { uploadUrl, s3Url: url } = await inbodyService.getPresignedUrl(file.name);
        await inbodyService.uploadToS3(uploadUrl, file);
        finalS3Url = url;
        setS3Url(url);
      }

      await inbodyService.processInbody({
        s3Url: finalS3Url,
        originalFilename: file.name,
        ocrText: ocrText.trim(),
        metrics,
        takenAt: takenAt ? dayjs(takenAt).toISOString() : undefined,
      });

      toast.success(t('inbody.processSuccess'));
      setFile(null);
      setOcrText('');
      setTakenAt(new Date());
      setShowPreview(false);
      setMetrics(undefined);
      setS3Url('');
      await refresh();
      await loadResults();
    } catch (error) {
      console.error('Process failed', error);
      toast.error(t('inbody.processError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 space-b-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('inbody.title')}</h1>
            <p className="text-muted-foreground">{t('inbody.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={(): void => navigate(AppRoutePath.Planner)}>
            {t('navigation.planner')}
          </Button>
        </div>

        <div className="p-4 space-y-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('inbody.uploadSection')}</h2>
            </div>
            <div className="text-sm">
              <span
                className={
                  inbodyQuota?.isDepleted
                    ? 'text-destructive font-semibold'
                    : 'text-primary font-semibold'
                }
              >
                {inbodyQuota?.formatted}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('inbody.selectFile')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isLoading || isScanning || isValidating}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(): void => setShowCamera(true)}
                    disabled={isLoading || isScanning || isValidating}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('inbody.scanDate')}</Label>
                <Input
                  className="w-1/2"
                  type="date"
                  value={takenAt ? dayjs(takenAt).format('YYYY-MM-DD') : ''}
                  onChange={(event): void => {
                    const dateValue = event.target.value;
                    setTakenAt(dateValue ? dayjs(dateValue).toDate() : new Date());
                  }}
                  disabled={isLoading || isScanning}
                />
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && file && (
              <div
                className={cn(
                  'border rounded-md p-3 text-sm',
                  validationResult.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800',
                )}
              >
                <div className="flex items-start gap-2">
                  {validationResult.isValid ? (
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      {validationResult.isValid
                        ? t('inbody.imageQualityGood')
                        : t('inbody.imageQualityIssues')}
                    </div>
                    {validationResult.errorKeys.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {validationResult.errorKeys.map((key: string, index: number) => (
                          <li key={index}>{t(key)}</li>
                        ))}
                      </ul>
                    )}
                    {validationResult.isValid && (
                      <div className="text-xs mt-2">
                        {t('inbody.qualityScore')}: {Math.round(validationResult.score)}/100
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isValidating && (
              <div className="text-sm text-muted-foreground text-center py-2">
                {t('inbody.validating')}...
              </div>
            )}
          </div>

          {file && !showPreview && (
            <Button
              onClick={handleScan}
              disabled={isScanning || inbodyQuota?.isDepleted || isValidating}
              className="w-full"
            >
              {isScanning ? t('inbody.scanning') : t('inbody.scanImage')}
            </Button>
          )}

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 mt-0">
              <div className="bg-background rounded-lg w-full max-w-2xl overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('inbody.cameraTitle')}</h3>
                  <Button variant="ghost" size="icon" onClick={(): void => setShowCamera(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-6">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: 'environment',
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} className="flex-1" variant="default">
                      <Camera className="h-4 w-4 mr-2" />
                      {t('inbody.capture')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(): void => setShowCamera(false)}
                      className="flex-1"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreview && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label>{t('inbody.ocrPreview')}</Label>
                <textarea
                  className={cn(
                    'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                  value={ocrText}
                  onChange={(e): void => setOcrText(e.target.value)}
                  placeholder={t('inbody.ocrPreviewPlaceholder')}
                />
              </div>

              {metrics && (
                <div className="bg-muted/30 border rounded-md p-3 text-sm">
                  <div className="font-semibold mb-2">{t('inbody.detectedMetrics')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {metrics.weight && (
                      <div>
                        <span className="text-muted-foreground">{t('inbody.weight')}: </span>
                        <span className="font-medium">{metrics.weight} kg</span>
                      </div>
                    )}
                    {metrics.bmi && (
                      <div>
                        <span className="text-muted-foreground">{t('inbody.bmi')}: </span>
                        <span className="font-medium">{metrics.bmi}</span>
                      </div>
                    )}
                    {metrics.bodyFatPercent && (
                      <div>
                        <span className="text-muted-foreground">{t('inbody.bodyFat')}: </span>
                        <span className="font-medium">{metrics.bodyFatPercent}%</span>
                      </div>
                    )}
                    {metrics.skeletalMuscleMass && (
                      <div>
                        <span className="text-muted-foreground">{t('inbody.muscleMass')}: </span>
                        <span className="font-medium">{metrics.skeletalMuscleMass} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleProcess}
                    disabled={isLoading || inbodyQuota?.isDepleted}
                    className="flex-1"
                  >
                    {isLoading ? t('common.loading') : t('inbody.processButton')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(): void => {
                      setShowPreview(false);
                      setOcrText('');
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleScan}
                  disabled={isScanning || !file}
                  className="w-full"
                >
                  {isScanning ? t('inbody.scanning') : t('inbody.rescanImage')}
                </Button>
              </div>
            </div>
          )}
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
                        setSelectedAnalysis(result.aiAnalysis as Translatable);
                      }
                    }}
                    onKeyDown={(e): void => {
                      if ((e.key === 'Enter' || e.key === ' ') && hasAnalysis) {
                        e.preventDefault();
                        setSelectedAnalysis(result.aiAnalysis as Translatable);
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
                        <div className="text-sm text-muted-foreground">
                          {result.metrics?.bodyFatPercent
                            ? t('inbody.bodyFatLabel', { value: result.metrics.bodyFatPercent })
                            : t('inbody.noMetrics')}
                        </div>
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
                            const analysis = result.aiAnalysis as unknown as Translatable;
                            const text = analysis[currentLang] || analysis.vi || analysis.en || '';
                            return text.slice(0, 100) + (text.length > 100 ? '...' : '');
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
            onClose={(): void => setSelectedAnalysis(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
