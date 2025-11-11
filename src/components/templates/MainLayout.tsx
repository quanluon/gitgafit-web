import React from 'react';
import { BottomNavigation } from '@organisms/BottomNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export function MainLayout({
  children,
  showBottomNav = true,
}: MainLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <main className={showBottomNav ? 'pb-16' : ''}>{children}</main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

