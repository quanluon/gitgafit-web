import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

/**
 * Custom hook for PWA installation management
 * Handles beforeinstallprompt event and provides install functionality
 */
export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Check if app is already installed (running in standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event): void => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      console.log('💾 PWA install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = (): void => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Trigger PWA installation prompt
   */
  const promptInstall = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.warn('⚠️ Install prompt not available');
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`👤 User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  /**
   * Dismiss the install prompt
   */
  const dismissPrompt = (): void => {
    setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
    dismissPrompt,
  };
}

