import React from 'react';
import { useTranslation } from 'react-i18next';
import { DayOfWeek } from '@/types/enums';
import { cn } from '@utils/cn';

interface DaySelectorProps {
  selectedDay: DayOfWeek | null;
  availableDays: DayOfWeek[];
  completedDays?: DayOfWeek[];
  onDaySelect: (day: DayOfWeek) => void;
}

export function DaySelector({
  selectedDay,
  availableDays,
  completedDays = [],
  onDaySelect,
}: DaySelectorProps): React.ReactElement {
  const { t } = useTranslation();
  const allDays = Object.values(DayOfWeek);

  const getDayLabel = (day: DayOfWeek): { short: string; full: string } => {
    const dayMap: Record<DayOfWeek, { short: string; full: string }> = {
      [DayOfWeek.MONDAY]: {
        short: t('common.days.monday'),
        full: t('common.days.monday'),
      },
      [DayOfWeek.TUESDAY]: {
        short: t('common.days.tuesday'),
        full: t('common.days.tuesday'),
      },
      [DayOfWeek.WEDNESDAY]: {
        short: t('common.days.wednesday'),
        full: t('common.days.wednesday'),
      },
      [DayOfWeek.THURSDAY]: {
        short: t('common.days.thursday'),
        full: t('common.days.thursday'),
      },
      [DayOfWeek.FRIDAY]: {
        short: t('common.days.friday'),
        full: t('common.days.friday'),
      },
      [DayOfWeek.SATURDAY]: {
        short: t('common.days.saturday'),
        full: t('common.days.saturday'),
      },
      [DayOfWeek.SUNDAY]: {
        short: t('common.days.sunday'),
        full: t('common.days.sunday'),
      },
    };
    return dayMap[day];
  };

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
        const dayLabel = getDayLabel(day);

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
            <span className="text-xs font-medium">{dayLabel.full}</span>
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
