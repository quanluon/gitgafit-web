import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@atoms/Button';
import { trainingService } from '@services/trainingService';
import { TrainingSession } from '@/types/workout';

interface TrainingCalendarProps {
  onDayClick: (date: Date, sessions: TrainingSession[]) => void;
}
export function TrainingCalendar({ onDayClick }: TrainingCalendarProps): React.ReactElement {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadSessions = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JS months are 0-indexed
      const data = await trainingService.getSessionsByMonth(year, month);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load training sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 7, then subtract 1 to make Monday = 0
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getSessionsForDate = (day: number): TrainingSession[] => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate.getDate() === day &&
        sessionDate.getMonth() === currentDate.getMonth() &&
        sessionDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handlePrevMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = (): void => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const monthName = currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfWeek = getFirstDayOfMonth(currentDate);

  const dayNames = [
    t('common.days.monday'),
    t('common.days.tuesday'),
    t('common.days.wednesday'),
    t('common.days.thursday'),
    t('common.days.friday'),
    t('common.days.saturday'),
    t('common.days.sunday'),
  ];

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            {t('statistics.today')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {dayNames.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {/* Days of month */}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const daySessions = getSessionsForDate(day);
          const hasWorkout = daySessions.length > 0;
          const isCurrentDay = isToday(day);
          const totalCalories = daySessions.reduce((sum, s) => sum + (s.totalCalories || 0), 0);
          const indicatorCount = Math.min(daySessions.length, 3);

          return (
            <button
              key={day}
              type="button"
              onClick={(): void => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                onDayClick(date, daySessions);
              }}
              disabled={isLoading}
              className={`
                w-full min-h-[56px] sm:aspect-square px-2 py-2 sm:p-2 rounded-xl text-xs sm:text-sm transition-all
                relative flex flex-col items-center justify-center touch-manipulation
                ${isCurrentDay ? 'ring-2 ring-primary font-semibold bg-primary/5' : 'bg-card'}
                ${hasWorkout ? 'border border-primary/30 hover:bg-primary/10' : 'border border-border hover:bg-accent/40'}
                ${!hasWorkout && !isCurrentDay ? 'text-muted-foreground' : ''}
              `}
            >
              <span className={`text-base sm:text-lg ${isCurrentDay ? 'text-primary' : ''}`}>{day}</span>

              {hasWorkout && totalCalories > 0 && (
                <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-orange-500 font-semibold">
                  <Flame className="w-3 h-3" />
                  <span>{totalCalories}</span>
                </div>
              )}

              {hasWorkout && totalCalories === 0 && (
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: indicatorCount }, (_, idx) => (
                    <div
                      key={`${day}-dot-${idx}`}
                      className="w-1.5 h-1.5 bg-primary rounded-full"
                      title={`${daySessions.length} ${
                        daySessions.length > 1 ? t('statistics.workouts') : t('statistics.workout')
                      }`}
                    />
                  ))}
                  {daySessions.length > indicatorCount && (
                    <span className="text-[10px] text-muted-foreground">+{daySessions.length - indicatorCount}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>{t('statistics.workoutCompleted')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded ring-2 ring-primary"></div>
          <span>{t('statistics.today')}</span>
        </div>
      </div>
    </div>
  );
}
