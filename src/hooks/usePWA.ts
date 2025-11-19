import { useState, useEffect } from 'react';

interface PWAInstallStatus {
  isInstallAllowed: boolean;
  isInstallWatingConfirm: boolean;
  isInstalling: boolean;
  isInstallCancelled: boolean;
  isInstallSuccess: boolean;
  isInstallFailed: boolean;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installStatus: PWAInstallStatus | null;
}
/**
 * Custom hook for PWA installation status management
 * Tracks installation state from react-pwa-installer-prompt callback
 */
export function usePWA(): PWAState {
  const [installStatus, setInstallStatus] = useState<PWAInstallStatus | null>(null);

  // Check if app is already installed (running in standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  // Determine if installable based on status
  const isInstallable = installStatus?.isInstallAllowed === true && !isStandalone;
  const isInstalled = installStatus?.isInstallSuccess === true || isStandalone;

  // Listen for status updates from PWAInstallerPrompt component
  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent<PWAInstallStatus>): void => {
      setInstallStatus(event.detail);
    };

    window.addEventListener('pwa-install-status', handleStatusUpdate as EventListener);

    return () => {
      window.removeEventListener('pwa-install-status', handleStatusUpdate as EventListener);
    };
  }, []);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    installStatus,
  };
}
