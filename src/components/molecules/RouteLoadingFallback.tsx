import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function RouteLoadingFallback(): React.ReactElement {
  return (
    <div className="top-[-25px] fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
      </div>
    </div>
  );
}

