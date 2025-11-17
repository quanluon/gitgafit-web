import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function RouteLoadingFallback(): React.ReactElement {
  return (
    <div className="modal-overlay bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
      </div>
    </div>
  );
}

