import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const daySessions = getSessionsForDate(day);
          const hasWorkout = daySessions.length > 0;
          const isCurrentDay = isToday(day);

          return (
            <button
              key={day}
              onClick={(): void => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                onDayClick(date, daySessions);
              }}
              disabled={isLoading}
              className={`
                aspect-square p-2 rounded-lg text-sm transition-all relative
                ${isCurrentDay ? 'ring-2 ring-primary font-bold' : ''}
                ${hasWorkout ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-accent'}
                ${!hasWorkout && !isCurrentDay ? 'text-muted-foreground' : ''}
              `}
            >
              <span className={isCurrentDay ? 'text-primary' : ''}>{day}</span>
              
              {/* Training indicator dot */}
              {hasWorkout && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {daySessions.map((_, idx) => (
                    <div
                      key={idx}
                      className="w-1 h-1 bg-primary rounded-full"
                      title={`${daySessions.length} ${daySessions.length > 1 ? t('statistics.workouts') : t('statistics.workout')}`}
                    />
                  ))}
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

