import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@atoms/Button';
import PWAInstallerPrompt from 'react-pwa-installer-prompt';
import { usePWA } from '@hooks/usePWA';

/**
 * PWA Install Prompt Component
 * Shows a banner/card prompting users to install the app
 * Only shows when app is installable and not already installed
 * Uses react-pwa-installer-prompt library for installation
 */
export function PWAInstallPrompt(): React.ReactElement | null {
  const { t } = useTranslation();
  const { isInstallable, isStandalone, installStatus } = usePWA();
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
  // - Installation was cancelled or failed
  if (
    isStandalone ||
    !isInstallable ||
    isDismissed ||
    installStatus?.isInstallCancelled === true ||
    installStatus?.isInstallFailed === true
  ) {
    return null;
  }
  const handleDismiss = (): void => {
    setIsDismissed(true);
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Handle installation status updates
  const handleCallback = (data: {
    isInstallAllowed: boolean;
    isInstallWatingConfirm: boolean;
    isInstalling: boolean;
    isInstallCancelled: boolean;
    isInstallSuccess: boolean;
    isInstallFailed: boolean;
  }): void => {
    // Dispatch custom event for usePWA hook
    window.dispatchEvent(
      new CustomEvent('pwa-install-status', { detail: data })
    );

    // Auto-dismiss on success
    if (data.isInstallSuccess) {
      setIsDismissed(true);
    }
  };

  return (
    <PWAInstallerPrompt
      render={({ onClick }: { onClick: () => void }) => (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg shadow-2xl p-4 border border-primary-foreground/20 relative">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10"
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
                    onClick={onClick}
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    disabled={installStatus?.isInstalling === true}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {installStatus?.isInstalling
                      ? t('generation.generating') || 'Installing...'
                      : t('pwa.installButton')}
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
      )}
      callback={handleCallback}
    />
  );
}
