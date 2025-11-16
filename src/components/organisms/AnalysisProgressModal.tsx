import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Brain } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@atoms/Button';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  progress: number;
  message: string;
  onClose?: () => void;
}

export function AnalysisProgressModal({
  isOpen,
  progress,
  message,
  onClose,
}: AnalysisProgressModalProps): React.ReactElement | null {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="top-[-16px] fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative bg-primary/10 rounded-full p-3">
                <Brain className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('inbody.analyzing')}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('inbody.progress')}</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-500 ease-out rounded-full',
                'relative overflow-hidden',
              )}
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Thinking animation */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="flex gap-1.5">
            <div
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1s' }}
            />
            <div
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '1s' }}
            />
            <div
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '1s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

