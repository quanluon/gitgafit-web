import { Language, MealType } from '@/types/enums';
import { DailyMealPlan, Meal, MealPlan } from '@/types/meal';
import { Button } from '@atoms/Button';
import { Label } from '@atoms/Label';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { MacrosCard } from '@molecules/MacrosCard';
import { mealService } from '@services/mealService';
import { useAuthStore } from '@store/authStore';
import { GenerationStatus, GenerationType, useGenerationStore } from '@store/generationStore';
import { useLocaleStore } from '@store/localeStore';
import { MainLayout } from '@templates/MainLayout';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function MealPlannerPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLocaleStore();
  const { user } = useAuthStore();

  const { startGeneration, jobs } = useGenerationStore();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [mealNotes, setMealNotes] = useState<string>('');
  const {
    refresh: refreshSubscriptionStats,
    formatQuotaDisplay,
    getQuotaInfo,
  } = useSubscriptionStats();

  // Check if there's already a meal generation in progress
  const hasActiveMealGeneration = jobs.some(
    (job) => job.type === GenerationType.MEAL && job.status === GenerationStatus.GENERATING,
  );

  const loadMealPlan = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      const plan = await mealService.getCurrentPlan();
      setMealPlan(plan);
    } catch (err) {
      // No plan exists, that's okay
      setError('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMealPlan();
  }, [loadMealPlan]);

  const refreshedMealJobs = useRef<Set<string>>(new Set());

  useEffect(() => {
    jobs.forEach((job) => {
      if (
        job.type === GenerationType.MEAL &&
        job.status === GenerationStatus.COMPLETED &&
        !refreshedMealJobs.current.has(job.jobId)
      ) {
        refreshedMealJobs.current.add(job.jobId);
        void loadMealPlan();
        void refreshSubscriptionStats();
      }
    });
  }, [jobs, loadMealPlan, refreshSubscriptionStats]);

  const handleGeneratePlan = async (fullWeek = false, useAI = false): Promise<void> => {
    // Prevent multiple generations
    if (isGenerating || hasActiveMealGeneration) {
      toast.error(
        t('generation.alreadyGenerating') ||
          'Your trainer is already creating a plan. Please wait.',
      );
      return;
    }

    // Check subscription quota for AI generation
    if (useAI && quotaInfo?.isDepleted) {
      toast.error(t('subscription.limitReached'));
      return;
    }

    // Check if user has required data
    if (!user?.weight || !user?.height || !user?.age || !user?.gender || !user?.activityLevel) {
      setError('Please complete your profile first (age, gender, activity level required)');
      setTimeout(() => navigate('/profile'), 2000);
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const notesPayload = mealNotes.trim() || undefined;
      // Start background generation
      const response = await mealService.generateMealPlan({ fullWeek, useAI, notes: notesPayload });

      if (response.jobId) {
        startGeneration(response.jobId, GenerationType.MEAL);
        toast.success(t('generation.mealPlan') + ' ' + t('generation.generationStarted'));
        // Reload subscription stats after starting generation
        void refreshSubscriptionStats();
      }
    } catch (err) {
      setError('Failed to start meal plan generation');
      toast.error('Failed to start meal plan generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentLang = language as Language;

  const mealTypeLabels: Record<MealType, string> = {
    [MealType.BREAKFAST]: t('meal.breakfast'),
    [MealType.LUNCH]: t('meal.lunch'),
    [MealType.DINNER]: t('meal.dinner'),
    [MealType.SNACK]: t('meal.snack'),
  };

  const quotaDisplay = formatQuotaDisplay(GenerationType.MEAL);
  const quotaInfo = getQuotaInfo(GenerationType.MEAL);

  const getMealIcon = (type: MealType): string => {
    const icons: Record<MealType, string> = {
      [MealType.BREAKFAST]: '🍳',
      [MealType.LUNCH]: '🍱',
      [MealType.DINNER]: '🍽️',
      [MealType.SNACK]: '🍎',
    };
    return icons[type];
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{t('navigation.mealPlanner')}</h1>
            </div>
            {/* Regenerate Options */}
            {mealPlan && (
              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(): Promise<void> => handleGeneratePlan(true, true)}
                  disabled={
                    isGenerating ||
                    hasActiveMealGeneration ||
                    !!(quotaInfo?.isDepleted)
                  }
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isGenerating || hasActiveMealGeneration ? 'animate-spin' : ''}`}
                  />
                  {t('common.regenerate')}{' '}
                  {quotaDisplay && (
                    <div className="text-xs text-muted-foreground ml-1">
                      {quotaDisplay}
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-8 space-y-6 mb-8">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="rounded-lg border bg-card/40 p-4 space-y-2">
          <Label>{t('meal.notesLabel')}</Label>
          <textarea
            className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={mealNotes}
            onChange={(event): void => setMealNotes(event.target.value)}
            placeholder={t('meal.notesPlaceholder') || ''}
          />
          <p className="text-xs text-muted-foreground">{t('meal.notesHelper')}</p>
        </div>

        {/* No Plan Yet */}
        {!mealPlan && (
          <div className="text-center py-12 space-y-6">
            <p className="text-muted-foreground">{t('meal.noMealPlan')}</p>

            {/* Subscription Info */}
            {quotaInfo && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t('subscription.mealGenerations')}: </span>
                <span
                  className={
                    quotaInfo.isDepleted ? 'text-destructive font-semibold' : 'text-primary font-semibold'
                  }
                >
                  {quotaInfo.formatted}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button
                onClick={(): Promise<void> => handleGeneratePlan(true, true)}
                size="lg"
                disabled={
                  isGenerating ||
                  hasActiveMealGeneration ||
                  !!(quotaInfo?.isDepleted)
                }
              >
                {isGenerating || hasActiveMealGeneration
                  ? t('generation.generating') || 'Generating...'
                  : t('meal.aiFullWeek')}
              </Button>
              {/* <Button
                onClick={(): Promise<void> => handleGeneratePlan(true, false)}
                size="lg"
                variant="outline"
                disabled={isGenerating || hasActiveMealGeneration}
              >
                {isGenerating || hasActiveMealGeneration
                  ? t('generation.generating') || 'Generating...'
                  : t('meal.templateFullWeek')}
              </Button> */}
            </div>

            {quotaInfo?.isDepleted && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm max-w-sm mx-auto">
                {t('subscription.upgradeToGenerate')}
              </div>
            )}
          </div>
        )}

        {/* Meal Plan Display */}
        {mealPlan && (
          <>
            {/* TDEE & Macros Overview */}
            <div className="space-b-4">
              <h2 className="text-xl font-bold">{t('meal.nutritionTargets')}</h2>

              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('meal.tdee')}</p>
                    <p className="text-2xl font-bold">{mealPlan.tdee}</p>
                    <p className="text-xs text-muted-foreground">{t('meal.maintenanceCalories')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('meal.target')}</p>
                    <p className="text-2xl font-bold">{mealPlan.dailyTargets.calories}</p>
                    <p className="text-xs text-muted-foreground">{t('meal.dailyGoal')}</p>
                  </div>
                </div>
              </div>

              <MacrosCard
                calories={mealPlan.dailyTargets.calories}
                protein={mealPlan.dailyTargets.protein}
                carbs={mealPlan.dailyTargets.carbs}
                fat={mealPlan.dailyTargets.fat}
              />
            </div>

            {/* Weekly Meal Schedule */}
            <div className="space-b-4">
              <h2 className="text-xl font-bold">{t('meal.weeklyPlan')}</h2>

              {mealPlan.schedule.map((day: DailyMealPlan) => {
                const dayName = day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1);
                const isExpanded = expandedDay === day.dayOfWeek;

                // Safe guard: Ensure meals array exists
                const meals = day.meals || [];

                return (
                  <div key={day.dayOfWeek} className="bg-card border rounded-lg overflow-hidden">
                    {/* Day Header */}
                    <button
                      onClick={(): void => setExpandedDay(isExpanded ? null : day.dayOfWeek)}
                      className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{dayName}</h3>
                        <span className="text-sm text-muted-foreground">
                          {meals.length} {t('meal.meals')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          {day.dailyTotals?.calories || 0} {t('meal.calories')}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Meals */}
                    {isExpanded && (
                      <div className="border-t p-4 space-y-4">
                        {meals.map((meal: Meal, mealIndex: number) => (
                          <div key={mealIndex} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getMealIcon(meal.type)}</span>
                              <h4 className="font-semibold">{mealTypeLabels[meal.type]}</h4>
                              <span className="text-sm text-muted-foreground">
                                {meal.totalMacros?.calories || 0} {t('meal.calories')}
                              </span>
                            </div>

                            <div className="space-y-2 pl-10">
                              {meal.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-start justify-between p-3 bg-secondary rounded-lg"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name[currentLang]}</p>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.description[currentLang]}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right text-xs">
                                    <p className="font-semibold">
                                      {item.macros?.calories || 0} {t('meal.calories')}
                                    </p>
                                    <p className="text-muted-foreground">
                                      P: {item.macros?.protein || 0}g
                                    </p>
                                    <p className="text-muted-foreground">
                                      C: {item.macros?.carbs || 0}g
                                    </p>
                                    <p className="text-muted-foreground">
                                      F: {item.macros?.fat || 0}g
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Meal Macros Summary */}
                            <div className="pl-10 pt-2 border-t flex gap-6 text-sm">
                              <span>
                                <strong>P:</strong> {meal.totalMacros?.protein}g
                              </span>
                              <span>
                                <strong>C:</strong> {meal.totalMacros?.carbs}g
                              </span>
                              <span>
                                <strong>F:</strong> {meal.totalMacros?.fat}g
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
