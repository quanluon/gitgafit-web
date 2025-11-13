import React from 'react';
import { useTranslation } from 'react-i18next';
import { Share, X, Plus, Smartphone } from 'lucide-react';
import { Button } from '@atoms/Button';

/**
 * iOS Install Instructions Component
 * Shows special instructions for iOS Safari users
 * (iOS doesn't support beforeinstallprompt, requires manual steps)
 */
export function IOSInstallPrompt(): React.ReactElement | null {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const [isDismissed, setIsDismissed] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    
    // Check if user dismissed recently (within 30 days)
    const dismissedAt = localStorage.getItem('ios-pwa-install-dismissed');
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentlyDismissed = dismissedAt && parseInt(dismissedAt, 10) > thirtyDaysAgo;

    // Show if iOS Safari and not in standalone mode and not recently dismissed
    if (isIOS && !isInStandaloneMode && !recentlyDismissed) {
      // Show after 5 seconds to not overwhelm user
      setTimeout(() => setIsVisible(true), 5000);
    }
  }, []);

  const handleDismiss = (): void => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('ios-pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-2xl p-4 border border-blue-400/30">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full p-1 shadow-md hover:scale-110 transition-transform"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="bg-white/20 p-3 rounded-full">
            <Smartphone className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-lg">{t('pwa.iosInstallTitle')}</h3>
              <p className="text-sm opacity-90 mt-1">
                {t('pwa.iosInstallDescription')}
              </p>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <div className="flex items-center gap-1">
                  <span>{t('pwa.iosStep1')}</span>
                  <Share className="h-4 w-4 inline-block" />
                  <span>{t('pwa.iosStep1Icon')}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <div className="flex items-center gap-1">
                  <span>{t('pwa.iosStep2')}</span>
                  <Plus className="h-4 w-4 inline-block" />
                  <span>{t('pwa.iosStep2Icon')}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>{t('pwa.iosStep3')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="secondary"
                className="flex-1"
              >
                {t('pwa.gotIt')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

