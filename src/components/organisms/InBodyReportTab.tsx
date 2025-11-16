import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { inbodyService } from '@services/inbodyService';
import { InbodyMetricsSummary } from '@/types/inbody';
import { validateImage, ValidationResult } from '@/utils/imageValidation';
import { Camera, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GenerationType } from '@/store/generationStore';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { CameraModal } from '@organisms/CameraModal';
import { AnalysisProgressModal } from '@organisms/AnalysisProgressModal';
import { socketService, WebSocketEvent } from '@services/socketService';

interface InBodyReportTabProps {
  quota?: ReturnType<typeof useSubscriptionStats>['getQuotaInfo'] extends (type: GenerationType) => infer R
    ? R
    : any;
  onRefresh?: () => Promise<void>;
}

export function InBodyReportTab({ quota, onRefresh }: InBodyReportTabProps): React.ReactElement {
  const { t } = useTranslation();
  const { refresh } = useSubscriptionStats();
  const [file, setFile] = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState<Date>(() => new Date());
  const [ocrText, setOcrText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<InbodyMetricsSummary | undefined>();
  const [s3Url, setS3Url] = useState<string>('');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');

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
        toast.success(t('inbody.imageValid'), { duration: 2000 });
      } else {
        const errorMessages = validation.errorKeys.map((key: string) => t(key)).join('. ');
        toast.error(errorMessages || t('inbody.imageInvalid'), { duration: 5000 });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(t('inbody.validationError'), { duration: 4000 });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCameraCapture = async (file: File): Promise<void> => {
    await validateAndSetFile(file);
    setShowCamera(false);
  };

  useEffect(() => {
    const handleStarted = (data: {
      message?: string;
      progress?: number;
    }): void => {
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      if (data.message) {
        setProgressMessage(data.message);
        setIsScanning(true);
      }
    };

    const handleProgress = (data: {
      progress?: number;
      message?: string;
    }): void => {
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      if (data.message) {
        setProgressMessage(data.message);
      }
    };

    const handleComplete = (data: { message?: string }): void => {
      setProgress(100);
      setTimeout(() => {
        setIsScanning(false);
        setProgress(0);
        setProgressMessage('');
      }, 500);
      if (data.message) {
        toast.dismiss('inbody-scan');
        toast.success(data.message, { id: 'inbody-scan', duration: 3000 });
      }
    };

    const handleError = (data: { message?: string }): void => {
      setIsScanning(false);
      setProgress(0);
      setProgressMessage('');
      if (data.message) {
        toast.dismiss('inbody-scan');
        toast.error(data.message, { id: 'inbody-scan', duration: 4000 });
      }
    };

    const unsubscribeStarted = socketService.on(
      WebSocketEvent.INBODY_SCAN_STARTED,
      handleStarted,
    );
    const unsubscribeProgress = socketService.on(
      WebSocketEvent.INBODY_SCAN_PROGRESS,
      handleProgress,
    );
    const unsubscribeComplete = socketService.on(
      WebSocketEvent.INBODY_SCAN_COMPLETE,
      handleComplete,
    );
    const unsubscribeError = socketService.on(WebSocketEvent.INBODY_SCAN_ERROR, handleError);

    return () => {
      unsubscribeStarted();
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [t]);

  const handleScan = async (): Promise<void> => {
    if (!file) {
      toast.error(t('inbody.fileRequired'));
      return;
    }

    try {
      setIsScanning(true);
      if (showPreview) {
        setShowPreview(false);
        setOcrText('');
        setMetrics(undefined);
      }

      const { uploadUrl, s3Url: url } = await inbodyService.getPresignedUrl(file.name);
      await inbodyService.uploadToS3(uploadUrl, file);
      setS3Url(url);

      const result = await inbodyService.scanImage(
        url,
        file.name,
        takenAt ? dayjs(takenAt).toISOString() : undefined,
      );

      setOcrText(result.ocrText || '');
      setMetrics(result.metrics);
      setShowPreview(true);
      toast.success(t('inbody.scanSuccess'), { duration: 3000 });
      await refresh();
      await onRefresh?.();
    } catch (error) {
      console.error('Scan failed', error);
      toast.error(t('inbody.scanError'), { duration: 4000 });
    } finally {
      setIsScanning(false);
    }
  };

  const handleProcess = async (): Promise<void> => {
    if (!file || !ocrText.trim()) {
      toast.error(t('inbody.ocrTextRequired'));
      return;
    }
    if (quota?.isDepleted) {
      toast.error(t('subscription.limitReached'));
      return;
    }

    try {
      setIsLoading(true);

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

      toast.success(t('inbody.processSuccess'), { duration: 3000 });
      setFile(null);
      setOcrText('');
      setTakenAt(new Date());
      setShowPreview(false);
      setMetrics(undefined);
      setS3Url('');
      await refresh();
      await onRefresh?.();
    } catch (error) {
      console.error('Process failed', error);
      toast.error(t('inbody.processError'), { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('inbody.uploadSection')}</h2>
        </div>
        <div className="text-sm">
          <span
            className={
              quota?.isDepleted
                ? 'text-destructive font-semibold'
                : 'text-primary font-semibold'
            }
          >
            {quota?.formatted}
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
          disabled={isScanning || quota?.isDepleted || isValidating}
          className="w-full"
        >
          {isScanning ? t('inbody.scanning') : t('inbody.scanImage')}
        </Button>
      )}

      <CameraModal
        isOpen={showCamera}
        onClose={(): void => setShowCamera(false)}
        onCapture={handleCameraCapture}
        facingMode="environment"
        title={t('inbody.cameraTitle')}
      />

      <AnalysisProgressModal
        isOpen={isScanning}
        progress={progress}
        message={progressMessage}
      />

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
                disabled={isLoading || quota?.isDepleted}
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
  );
}

