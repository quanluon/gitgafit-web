import { useToast } from '@/hooks/useToast';
import { GenerationType } from '@/store/generationStore';
import { cn } from '@/utils/cn';
import { validateImage, ValidationResult } from '@/utils/imageValidation';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { inbodyService } from '@services/inbodyService';
import { FileUploadCard } from '@molecules/FileUploadCard';
import dayjs from 'dayjs';
import { AlertCircle, Check } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SubscriptionQuotaInfo = ReturnType<typeof useSubscriptionStats> extends {
  getQuotaInfo: (type: GenerationType) => infer R;
}
  ? R
  : { formatted?: string; isDepleted?: boolean };

interface InBodyReportTabProps {
  quota?: SubscriptionQuotaInfo;
  onRefresh?: () => Promise<void>;
}
export function InBodyReportTab({ quota, onRefresh }: InBodyReportTabProps): React.ReactElement {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { refresh } = useSubscriptionStats();
  const [file, setFile] = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState<Date>(() => new Date());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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


  const handleAnalyze = async (): Promise<void> => {
    if (!file) {
      showError(t('inbody.fileRequired'));
      return;
    }
    if (quota?.isDepleted) {
      showError(t('subscription.limitReached'));
      return;
    }
    try {
      setIsScanning(true);

      const { uploadUrl, s3Url } = await inbodyService.getPresignedUrl(file.name);
      await inbodyService.uploadToS3(uploadUrl, file);

      await inbodyService.analyzeInBackground({
        s3Url,
        originalFilename: file.name,
        takenAt: takenAt ? dayjs(takenAt).toISOString() : undefined,
      });

      showSuccess(t('inbody.analysisQueued'), { duration: 3000 });
      setFile(null);
      setTakenAt(new Date());
      setValidationResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await refresh();
      await onRefresh?.();
    } catch (error) {
      console.error('Failed to submit InBody analysis', error);
      showError(t('inbody.scanError'), { duration: 4000 });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsScanning(false);
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
          <FileUploadCard
            ref={fileInputRef}
            inputId="inbody-upload"
            label={t('inbody.selectFile')}
            placeholder={t('inbody.chooseImage')}
            helperText={t('inbody.supportedFormats')}
            buttonLabel={t('inbody.tapToUpload')}
            fileName={file?.name}
            disabled={isScanning || isValidating || !!quota?.isDepleted}
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
              disabled={isScanning}
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

      {quota?.isDepleted && (
        <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg py-2">
          {t('inbody.quotaDepleted')}
        </p>
      )}
      {file && !quota?.isDepleted && (
        <Button
          onClick={handleAnalyze}
          disabled={isScanning || quota?.isDepleted || isValidating}
          className="w-full"
        >
          {isScanning ? t('inbody.scanning') : t('inbody.scanAndAnalyze')}
        </Button>
      )}
      {file && (
        <p className="text-xs text-muted-foreground text-center">
          {t('inbody.backgroundInfo')}
        </p>
      )}
    </div>
  );
}
