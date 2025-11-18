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
  const safeAreaTop = 'env(safe-area-inset-top, 0)';
  const safeAreaBottom = 'env(safe-area-inset-bottom, 0)';

  return (
    <div 
      className="bg-background flex flex-col overflow-hidden"
      style={{
        minHeight: '100vh',
        height: '100dvh',
      }}
    >
      <main 
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: safeAreaTop,
          paddingBottom: showBottomNav
            ? `calc(4rem + ${safeAreaBottom})`
            : safeAreaBottom,
        }}
      >
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
