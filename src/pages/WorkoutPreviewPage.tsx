import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Check } from 'lucide-react';
import { Button } from '@atoms/Button';
import { useWorkoutStore } from '@store/workoutStore';
import { useAuthStore } from '@store/authStore';
import { workoutService } from '@services/workoutService';
import { Language, DayOfWeek } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';
import { AppRoutePath } from '@/routes/paths';

export function WorkoutPreviewPage(): React.ReactElement {
  const navigate = useNavigate();
  const { language } = useLocaleStore();
  const { user } = useAuthStore();
  const { currentPlan, setCurrentPlan } = useWorkoutStore();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load current plan if not in store
    const loadPlan = async (): Promise<void> => {
      if (!currentPlan) {
        try {
          const plan = await workoutService.getCurrentPlan();
          setCurrentPlan(plan);
        } catch (err) {
          // If no plan exists, redirect to onboarding
          navigate(AppRoutePath.Onboarding);
        }
      }
    };
    loadPlan();
  }, [currentPlan, navigate, setCurrentPlan]);

  const handleRegenerate = async (): Promise<void> => {
    if (!user?.goal || !user?.experienceLevel || !user?.scheduleDays) {
      setError('Missing user profile data. Please complete onboarding again.');
      return;
    }

    // Navigate to onboarding to start background generation
    navigate(AppRoutePath.Onboarding);
  };

  const handleAccept = (): void => {
    navigate('/');
  };

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  const currentLang = language as Language;

  const dayOrder: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  const sortedSchedule = [...currentPlan.schedule].sort((a, b) => {
    return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Your Personalized Workout Plan</h1>
            <p className="text-muted-foreground">
              Review your customized plan. You can regenerate if needed.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-b-6 pb-24">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Plan Overview */}
        <div className="bg-card border rounded-lg p-6 space-y-3">
          <h2 className="font-semibold">Plan Overview</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Training Days</p>
              <p className="font-semibold">{currentPlan.schedule.length} days/week</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Exercises</p>
              <p className="font-semibold">
                {currentPlan.schedule.reduce((sum, day) => sum + day.exercises.length, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Weekly Schedule</h2>

          {sortedSchedule.map((day) => {
            const focus = day.focus[currentLang];
            const dayName = day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1);

            return (
              <div key={day.dayOfWeek} className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{dayName}</h3>
                    <p className="text-sm text-muted-foreground">{focus}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {day.exercises.length} exercises
                  </div>
                </div>

                <div className="space-y-2">
                  {day.exercises.map((exercise, index) => {
                    const exerciseName = exercise.name[currentLang];
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{exerciseName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleRegenerate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Plan
          </Button>
          <Button className="flex-1" onClick={handleAccept}>
            <Check className="h-4 w-4 mr-2" />
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

