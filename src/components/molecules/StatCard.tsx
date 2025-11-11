import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps): React.ReactElement {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

