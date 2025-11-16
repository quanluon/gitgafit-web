import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Camera, Upload, Lightbulb } from 'lucide-react';
import { validateImage, ValidationResult } from '@/utils/imageValidation';
import { GenerationType } from '@/store/generationStore';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { cn } from '@/utils/cn';
import { AnalysisProgressModal } from '@organisms/AnalysisProgressModal';
import { inbodyService } from '@/services/inbodyService';
import { socketService, WebSocketEvent } from '@services/socketService';

interface BodyPhotoTabProps {
  quota?: ReturnType<typeof useSubscriptionStats>['getQuotaInfo'] extends (
    type: GenerationType,
  ) => infer R
    ? R
    : never;
  onRefresh?: () => Promise<void>;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

export function BodyPhotoTab({
  quota,
  onRefresh,
  onAnalyzingChange,
}: BodyPhotoTabProps): React.ReactElement {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState<Date>(() => new Date());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        showSuccess(t('inbody.imageValid'), { duration: 2000 });
      } else {
        const errorMessages = validation.errorKeys.map((key: string) => t(key)).join('. ');
        showError(errorMessages || t('inbody.imageInvalid'), { duration: 5000 });
      }
    } catch (error) {
      console.error('Validation error:', error);
      showError(t('inbody.validationError'), { duration: 4000 });
    } finally {
      setIsValidating(false);
    }
  };


  useEffect(() => {
    const handleStarted = (data: {
      resultId?: string;
      message?: string;
      progress?: number;
    }): void => {
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      if (data.message) {
        setProgressMessage(data.message);
        setIsAnalyzing(true);
      }
    };

    const handleProgress = (data: {
      resultId?: string;
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

    const handleComplete = async (data: { resultId?: string; message?: string }): Promise<void> => {
      setProgress(100);
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
        setProgressMessage('');
        onAnalyzingChange?.(false);
      }, 500);
      showSuccess(data.message || t('inbody.bodyPhoto.analysisStarted'), {
        id: 'body-photo-analysis',
        duration: 3000,
      });
      setFile(null);
      setValidationResult(null);
      await onRefresh?.();
    };

    const handleError = (data: { resultId?: string; message?: string }): void => {
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage('');
      onAnalyzingChange?.(false);
      showError(data.message || t('inbody.bodyPhoto.analysisError'), {
        id: 'body-photo-analysis',
        duration: 4000,
      });
    };

    const unsubscribeStarted = socketService.on(
      WebSocketEvent.BODY_PHOTO_ANALYSIS_STARTED,
      handleStarted,
    );
    const unsubscribeProgress = socketService.on(
      WebSocketEvent.BODY_PHOTO_ANALYSIS_PROGRESS,
      handleProgress,
    );
    const unsubscribeComplete = socketService.on(
      WebSocketEvent.BODY_PHOTO_ANALYSIS_COMPLETE,
      handleComplete,
    );
    const unsubscribeError = socketService.on(
      WebSocketEvent.BODY_PHOTO_ANALYSIS_ERROR,
      handleError,
    );

    return () => {
      unsubscribeStarted();
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [t, onRefresh]);

  const handleAnalyze = async (): Promise<void> => {
    if (!file) {
      showError(t('inbody.bodyPhoto.fileRequired'));
      return;
    }
    if (quota?.isDepleted) {
      showError(t('subscription.limitReached'));
      return;
    }

    try {
      setIsAnalyzing(true);
      onAnalyzingChange?.(true);
      const { uploadUrl, s3Url } = await inbodyService.getPresignedUrl(file.name);
      await inbodyService.uploadToS3(uploadUrl, file);

      await inbodyService.analyzeBodyPhoto(
        s3Url,
        file.name,
        takenAt ? dayjs(takenAt).toISOString() : undefined,
      );

      showSuccess(t('inbody.bodyPhoto.analysisStarted'), { duration: 3000 });
    } catch (error) {
      console.error('Analysis failed', error);
      showError(t('inbody.bodyPhoto.analysisError'), { duration: 4000 });
      setIsAnalyzing(false);
      onAnalyzingChange?.(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('inbody.bodyPhoto.title')}</h2>
        </div>
        <div className="text-sm">
          <span
            className={
              quota?.isDepleted ? 'text-destructive font-semibold' : 'text-primary font-semibold'
            }
          >
            {quota?.formatted}
          </span>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm mb-1">{t('inbody.bodyPhoto.description')}</div>
            <div className="text-xs text-muted-foreground">{t('inbody.bodyPhoto.estimates')}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('inbody.bodyPhoto.selectPhoto')}</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isAnalyzing || isValidating}
                className="flex-1 hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={(): void => fileInputRef.current?.click()}
                disabled={isAnalyzing || isValidating}
                className="flex-1 gap-2"
              >
                <Upload className="h-4 w-4" />
                {t('inbody.bodyPhoto.selectFromGallery')}
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                onClick={(): void => setShowCamera(true)}
                disabled={isAnalyzing || isValidating}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
              </Button> */}
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
              disabled={isAnalyzing}
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
                <div className="text-emerald-600">✓</div>
              ) : (
                <div className="text-amber-600">⚠</div>
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
              </div>
            </div>
          </div>
        )}

        {isValidating && (
          <div className="text-sm text-muted-foreground text-center py-2">
            {t('inbody.validating')}...
          </div>
        )}

        {file && validationResult?.isValid && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || quota?.isDepleted}
            className="w-full"
          >
            {isAnalyzing ? t('inbody.bodyPhoto.analyzing') : t('inbody.bodyPhoto.analyzeButton')}
          </Button>
        )}
      </div>

      <div className="bg-muted/30 border rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-sm mb-2">{t('inbody.bodyPhoto.tipsTitle')}</div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('inbody.bodyPhoto.tip1')}</li>
              <li>{t('inbody.bodyPhoto.tip2')}</li>
              <li>{t('inbody.bodyPhoto.tip3')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* <CameraModal
        isOpen={showCamera}
        onClose={(): void => setShowCamera(false)}
        onCapture={handleCameraCapture}
        facingMode="user"
        title={t('inbody.bodyPhoto.cameraTitle')}
      /> */}

      <AnalysisProgressModal
        isOpen={isAnalyzing}
        progress={progress}
        message={progressMessage}
        estimatedTime={10}
      />
    </div>
  );
}
