import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Camera, Lightbulb } from 'lucide-react';
import { validateImage, ValidationResult } from '@/utils/imageValidation';
import { GenerationStatus, GenerationType, useGenerationStore } from '@/store/generationStore';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { cn } from '@/utils/cn';
import { AnalysisProgressModal } from '@organisms/AnalysisProgressModal';
import { inbodyService } from '@/services/inbodyService';
import { FileUploadCard } from '@molecules/FileUploadCard';
import { useGenerationJob } from '@/hooks/useGenerationJob';

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
  const { startGeneration } = useGenerationStore();
  const [file, setFile] = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState<Date>(() => new Date());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePicked = async (selectedFile: File): Promise<void> => {
    await validateAndSetFile(selectedFile);
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


  const resetUploadState = useCallback(() => {
    setFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleJobComplete = useCallback(
    async (resultId?: string) => {
      const effectiveResultId = resultId || currentJobId;
      if (!effectiveResultId || (currentJobId && effectiveResultId !== currentJobId)) {
        return;
      }

      setProgress(100);

      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
        setProgressMessage('');
        onAnalyzingChange?.(false);
        setCurrentJobId(null);
      }, 300);

      showSuccess(t('generation.bodyPhotoComplete') || 'Body photo analyzed successfully!');
      resetUploadState();
      await onRefresh?.();
    },
    [currentJobId, onAnalyzingChange, onRefresh, resetUploadState, showSuccess, t],
  );

  const { activeJob } = useGenerationJob({
    type: GenerationType.BODY_PHOTO,
    onComplete: handleJobComplete,
  });

  useEffect(() => {
    if (
      currentJobId &&
      activeJob &&
      activeJob.jobId === currentJobId &&
      activeJob.status === GenerationStatus.ERROR
    ) {
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage('');
      onAnalyzingChange?.(false);
      setCurrentJobId(null);
      showError(activeJob.error || t('generation.failed'));
    }
  }, [activeJob, currentJobId, onAnalyzingChange, showError, t]);

  useEffect(() => {
    if (!isAnalyzing) return undefined;

    setProgress((prev) => (prev === 0 ? 5 : prev));
    setProgressMessage(t('inbody.bodyPhoto.analyzing'));

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        return prev + 5;
      });
    }, 1500);

    return () => {
      window.clearInterval(interval);
    };
  }, [isAnalyzing, t]);

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

      const result = await inbodyService.analyzeBodyPhoto(
        s3Url,
        file.name,
        takenAt ? dayjs(takenAt).toISOString() : undefined,
      );

      if (result?._id) {
        startGeneration(result._id, GenerationType.BODY_PHOTO);
        setCurrentJobId(result._id);
        setProgress(5);
      }

      setProgressMessage(t('inbody.bodyPhoto.analyzing'));
      showSuccess(t('inbody.bodyPhoto.analysisStarted'), { duration: 3000 });
    } catch (error) {
      console.error('Analysis failed', error);
      showError(t('inbody.bodyPhoto.analysisError'), { duration: 4000 });
      setIsAnalyzing(false);
      onAnalyzingChange?.(false);
      setCurrentJobId(null);
      setProgress(0);
      setProgressMessage('');
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
          <FileUploadCard
            ref={fileInputRef}
            inputId="body-photo-upload"
            label={t('inbody.bodyPhoto.selectPhoto')}
            placeholder={t('inbody.bodyPhoto.selectFromGallery')}
            helperText={t('inbody.supportedFormats')}
            buttonLabel={t('inbody.tapToUpload')}
            fileName={file?.name}
            disabled={isAnalyzing || isValidating || !!quota?.isDepleted}
            accept="image/*"
            onFileSelect={handleFilePicked}
          />
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
        {quota?.isDepleted && (
          <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg py-2">
            {t('inbody.quotaDepleted')}
          </p>
        )}
        {file && validationResult?.isValid && !quota?.isDepleted && (
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

      <AnalysisProgressModal
        isOpen={isAnalyzing}
        progress={progress}
        message={progressMessage}
        estimatedTime={10}
      />
    </div>
  );
}
