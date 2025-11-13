import React from 'react';
import { BottomNavigation } from '@organisms/BottomNavigation';
import { PWAInstallButton } from '@molecules/PWAInstallButton';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showPWAButton?: boolean;
}

export function MainLayout({
  children,
  showBottomNav = true,
  showPWAButton = false,
}: MainLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <main className={showBottomNav ? 'pb-16' : ''}>
        {children}
        {/* Optional PWA Install Button in header/nav */}
        {showPWAButton && (
          <div className="fixed top-4 right-4 z-30">
            <PWAInstallButton variant="outline" size="sm" />
          </div>
        )}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

