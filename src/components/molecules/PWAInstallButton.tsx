import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@atoms/Button';
import PWAInstallerPrompt from 'react-pwa-installer-prompt';
import { usePWA } from '@hooks/usePWA';

interface PWAInstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}
/**
 * PWA Install Button Component
 * Can be placed anywhere in the app to trigger PWA installation
 * Automatically hides if not installable or already installed
 * Uses react-pwa-installer-prompt library
 */
export function PWAInstallButton({
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true,
}: PWAInstallButtonProps): React.ReactElement | null {
  const { t } = useTranslation();
  const { isInstallable, isStandalone, installStatus } = usePWA();

  // Don't show if already installed or not installable
  if (isStandalone || !isInstallable) {
    return null;
  }
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
  };

  return (
    <PWAInstallerPrompt
      render={({ onClick }: { onClick: () => void }) => (
        <Button
          onClick={onClick}
          variant={variant}
          size={size}
          className={className}
          disabled={installStatus?.isInstalling === true}
        >
          {showIcon && <Download className="h-4 w-4 mr-2" />}
          {installStatus?.isInstalling
            ? t('generation.generating') || 'Installing...'
            : t('pwa.installApp')}
        </Button>
      )}
      callback={handleCallback}
    />
  );
}
