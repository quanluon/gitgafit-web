import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atoms/Button';
import { Sparkles } from 'lucide-react';

interface RedirectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  redirectPath: string;
  redirectDelay?: number; // in seconds
  title?: string;
  message?: string;
  goNowLabel?: string;
  showCancel?: boolean;
}

export function RedirectModal({
  isOpen,
  onClose,
  redirectPath,
  redirectDelay = 3,
  title,
  message,
  goNowLabel,
  showCancel = true,
}: RedirectModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(redirectDelay);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, navigate, redirectPath]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(redirectDelay);
    }
  }, [isOpen, redirectDelay]);

  if (!isOpen) return null;

    const handleGoNow = (): void => {
      navigate(redirectPath);
    };

    const defaultTitle = title || t('common.redirectModal.title');
    // If message is provided, use it with countdown interpolation, otherwise use default
    const defaultMessage = message
      ? message.replace('{{seconds}}', countdown.toString())
      : t('common.redirectModal.message', { seconds: countdown });
    const defaultGoNowLabel = goNowLabel || t('common.redirectModal.goNow');

    return (
      <div className="modal-overlay">
        <div className="modal-container border p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{defaultTitle}</h3>
            <p className="text-sm text-muted-foreground">{defaultMessage}</p>
          </div>

          <div className="flex gap-3">
            {showCancel && onClose && (
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t('common.cancel')}
              </Button>
            )}
            <Button onClick={handleGoNow} className={showCancel && onClose ? 'flex-1' : 'w-full'}>
              {defaultGoNowLabel}
            </Button>
          </div>
        </div>
      </div>
    );
}

