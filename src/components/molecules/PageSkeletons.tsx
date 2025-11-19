import React from 'react';
import { Skeleton } from '@atoms/Skeleton';

const repeat = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

interface SectionProps {
  rows?: number;
}

const SectionBlock = ({ rows = 3 }: SectionProps): React.ReactElement => (
  <div className="space-y-2">
    <Skeleton className="h-5 w-32" />
    {repeat(rows).map((key) => (
      <Skeleton key={key} className="h-4 w-full" />
    ))}
  </div>
);

interface CardRowProps {
  cards?: number;
  height?: string;
}

const CardRow = ({ cards = 3, height = 'h-24' }: CardRowProps): React.ReactElement => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {repeat(cards).map((key) => (
      <Skeleton key={key} className={`w-full ${height}`} />
    ))}
  </div>
);

export function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-6 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <CardRow cards={3} height="h-28" />
      <SectionBlock rows={5} />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function AuthPageSkeleton(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <Skeleton className="h-8 w-32 mx-auto" />
        {repeat(4).map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function PlannerSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-9 w-56" />
      <SectionBlock rows={4} />
      <CardRow cards={2} height="h-40" />
      <SectionBlock rows={3} />
    </div>
  );
}

export function TrainingSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-7 w-40" />
      <CardRow cards={2} height="h-32" />
      <SectionBlock rows={4} />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export function StatisticsSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-7 w-48" />
      <CardRow cards={3} height="h-20" />
      <SectionBlock rows={6} />
    </div>
  );
}

export function MealPlannerSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-8 w-44" />
      <SectionBlock rows={5} />
      <CardRow cards={3} height="h-36" />
    </div>
  );
}

export function ProfileSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <SectionBlock rows={4} />
      <CardRow cards={2} height="h-20" />
    </div>
  );
}

export function OnboardingSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-7 w-52" />
      <SectionBlock rows={5} />
      <SectionBlock rows={5} />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function WorkoutPreviewSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <SectionBlock rows={4} />
    </div>
  );
}

export function InbodySkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen space-y-4 bg-background px-4 py-6 sm:px-6">
      <Skeleton className="h-8 w-40" />
      <CardRow cards={2} height="h-32" />
      <SectionBlock rows={4} />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}


