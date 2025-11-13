import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@atoms/Button';
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
 */
export function PWAInstallButton({
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true,
}: PWAInstallButtonProps): React.ReactElement | null {
  const { t } = useTranslation();
  const { isInstallable, isStandalone, promptInstall } = usePWA();

  // Don't show if already installed or not installable
  if (isStandalone || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={promptInstall}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <Download className="h-4 w-4 mr-2" />}
      {t('pwa.installApp')}
    </Button>
  );
}

