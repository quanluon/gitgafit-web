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
  analysis: Translatable;
  onClose: () => void;
}

export function InbodyAnalysisModal({
  analysis,
  onClose,
}: InbodyAnalysisModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { language } = useLocaleStore();
  const currentLang = language as Language;

  const analysisText = analysis[currentLang] || analysis.vi || analysis.en || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisText}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-6">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

