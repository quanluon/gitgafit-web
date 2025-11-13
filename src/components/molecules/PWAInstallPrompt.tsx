import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@atoms/Button';
import { usePWA } from '@hooks/usePWA';

/**
 * PWA Install Prompt Component
 * Shows a banner/card prompting users to install the app
 * Only shows when app is installable and not already installed
 */
export function PWAInstallPrompt(): React.ReactElement | null {
  const { t } = useTranslation();
  const { isInstallable, isStandalone, promptInstall, dismissPrompt } = usePWA();
  const [isDismissed, setIsDismissed] = React.useState<boolean>(false);

  // Check if user dismissed recently (within 7 days)
  React.useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (dismissedTime > sevenDaysAgo) {
        setIsDismissed(true);
      }
    }
  }, []);

  // Don't show if:
  // - Already installed/standalone
  // - Not installable
  // - User dismissed it
  if (isStandalone || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async (): Promise<void> => {
    await promptInstall();
    setIsDismissed(true);
  };

  const handleDismiss = (): void => {
    dismissPrompt();
    setIsDismissed(true);
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg shadow-2xl p-4 border border-primary-foreground/20">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="bg-primary-foreground/20 p-3 rounded-full">
            <Smartphone className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-lg">{t('pwa.installTitle')}</h3>
              <p className="text-sm opacity-90 mt-1">
                {t('pwa.installDescription')}
              </p>
            </div>

            {/* Features */}
            <ul className="text-xs space-y-1 opacity-90">
              <li>✓ {t('pwa.feature1')}</li>
              <li>✓ {t('pwa.feature2')}</li>
              <li>✓ {t('pwa.feature3')}</li>
            </ul>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                variant="secondary"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('pwa.installButton')}
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                {t('pwa.notNow')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

