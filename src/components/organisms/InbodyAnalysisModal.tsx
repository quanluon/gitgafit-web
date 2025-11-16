import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Translatable } from '@/types/common';
import { useLocaleStore } from '@/store/localeStore';
import { Language } from '@/types/enums';

interface InbodyAnalysisModalProps {
  analysis:
    | Translatable
    | {
        en: {
          body_composition_summary: string;
          recommendations: string[];
          training_nutrition_advice: string;
        };
        vi: {
          body_composition_summary: string;
          recommendations: string[];
          training_nutrition_advice: string;
        };
      };
  onClose: () => void;
}

interface StructuredAnalysis {
  body_composition_summary: string;
  recommendations: string[];
  training_nutrition_advice: string;
}

function isStructuredAnalysis(
  analysis: Translatable | { en: StructuredAnalysis; vi: StructuredAnalysis },
): analysis is { en: StructuredAnalysis; vi: StructuredAnalysis } {
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
  onClose,
}: InbodyAnalysisModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

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
    <div className="top-[-16px] fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('inbody.analysisTitle')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </div>
    </div>
  );
}

