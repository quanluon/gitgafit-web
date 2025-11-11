import React from 'react';
import { DayOfWeek } from '@/types/enums';
import { cn } from '@utils/cn';

interface DaySelectorProps {
  selectedDay: DayOfWeek | null;
  availableDays: DayOfWeek[];
  completedDays?: DayOfWeek[];
  onDaySelect: (day: DayOfWeek) => void;
}

const dayLabels: Record<DayOfWeek, { short: string; full: string; date?: number }> = {
  [DayOfWeek.MONDAY]: { short: 'Mon', full: 'Monday' },
  [DayOfWeek.TUESDAY]: { short: 'Tue', full: 'Tuesday' },
  [DayOfWeek.WEDNESDAY]: { short: 'Wed', full: 'Wednesday' },
  [DayOfWeek.THURSDAY]: { short: 'Thu', full: 'Thursday' },
  [DayOfWeek.FRIDAY]: { short: 'Fri', full: 'Friday' },
  [DayOfWeek.SATURDAY]: { short: 'Sat', full: 'Saturday' },
  [DayOfWeek.SUNDAY]: { short: 'Sun', full: 'Sunday' },
};

export function DaySelector({
  selectedDay,
  availableDays,
  completedDays = [],
  onDaySelect,
}: DaySelectorProps): React.ReactElement {
  const allDays = Object.values(DayOfWeek);

  // Get current date info for display
  const today = new Date();
  const currentDayOfWeek = Object.values(DayOfWeek)[today.getDay() === 0 ? 6 : today.getDay() - 1];

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {allDays.map((day) => {
        const isAvailable = availableDays.includes(day);
        const isSelected = selectedDay === day;
        const isCompleted = completedDays.includes(day);
        const isToday = day === currentDayOfWeek;

        return (
          <button
            key={day}
            onClick={(): void => {
              if (isAvailable) onDaySelect(day);
            }}
            disabled={!isAvailable}
            className={cn(
              'flex flex-col items-center justify-center min-w-[60px] h-20 rounded-lg border-2 transition-all',
              isSelected && 'border-primary bg-primary text-primary-foreground',
              !isSelected && isAvailable && 'border-border hover:border-primary/50',
              !isAvailable && 'opacity-40 cursor-not-allowed',
              isCompleted && !isSelected && 'bg-green-500/10 border-green-500',
            )}
          >
            <span className="text-xs font-medium">{dayLabels[day].short}</span>
            {isToday && (
              <div className="w-1.5 h-1.5 rounded-full bg-current mt-1" />
            )}
            {isCompleted && !isSelected && (
              <div className="text-xs text-green-600 mt-1">✓</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

