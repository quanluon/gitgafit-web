import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Translatable, InbodyAnalysis } from '@/types/inbody';
import { useLocaleStore } from '@/store/localeStore';
import { Language } from '@/types/enums';

interface InbodyAnalysisModalProps {
  analysis: Translatable | InbodyAnalysis;
  s3Url?: string | null;
  onClose: () => void;
}

function isStructuredAnalysis(
  analysis: Translatable | InbodyAnalysis,
): analysis is InbodyAnalysis {
  return (
    typeof analysis === 'object' &&
    analysis !== null &&
    'en' in analysis &&
    'vi' in analysis &&
    typeof (analysis as { en: unknown }).en === 'object' &&
    (analysis as { en: unknown }).en !== null &&
    'body_composition_summary' in ((analysis as { en: unknown }).en as object)
  );
}

export function InbodyAnalysisModal({
  analysis,
  s3Url,
  onClose,
}: InbodyAnalysisModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;
  const [showImage, setShowImage] = useState<boolean>(false);

  const renderContent = (): React.ReactElement => {
    if (isStructuredAnalysis(analysis)) {
      const current = analysis[currentLang] || analysis.vi || analysis.en;

      return (
        <div className="space-y-6">
          {/* Body Composition Summary */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">
              {t('inbody.analysis.bodyCompositionSummary')}
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {current.body_composition_summary}
              </ReactMarkdown>
            </div>
          </div>

          {/* Recommendations */}
          {current.recommendations && current.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                {t('inbody.analysis.recommendations')}
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                {current.recommendations.map((rec, index) => (
                  <li key={index} className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{rec}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Training & Nutrition Advice */}
          {current.training_nutrition_advice && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                {t('inbody.analysis.trainingNutritionAdvice')}
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {current.training_nutrition_advice}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback to old string format
    const analysisText = analysis[currentLang] || analysis.vi || analysis.en || '';
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisText}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="top-[-25px] fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('inbody.analysisTitle')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Analysis Content */}
            {renderContent()}

            {/* Image Collapse Section */}
            {s3Url && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={(): void => setShowImage(!showImage)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{t('inbody.viewUploadedImage')}</span>
                  </div>
                  {showImage ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {showImage && (
                  <div className="border-t p-4 bg-muted/30">
                    <div className="flex justify-center">
                      <img
                        src={s3Url}
                        alt={t('inbody.uploadedImage')}
                        className="max-w-full h-auto max-h-[500px] rounded-lg shadow-lg object-contain"
                        onError={(e): void => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'text-sm text-muted-foreground text-center py-4';
                          errorDiv.textContent = t('inbody.imageLoadError');
                          target.parentNode?.appendChild(errorDiv);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
