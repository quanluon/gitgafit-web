import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps): React.ReactElement {
  return <div className={cn('animate-pulse rounded-md bg-muted/80', className)} />;
}


