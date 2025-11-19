import { MealPlannerSkeleton } from '@/components/molecules';
import { useGenerationJob } from '@/hooks/useGenerationJob';
import { useToast } from '@/hooks/useToast';
import { DayOfWeek, MealType } from '@/types/enums';
import { DailyMealPlan, Meal, MealPlan } from '@/types/meal';
import { Button } from '@atoms/Button';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';
import { MacrosCard } from '@molecules/MacrosCard';
import { MealPlanGenerationModal } from '@organisms/MealPlanGenerationModal';
import { RedirectToProfileModal } from '@organisms/RedirectToProfileModal';
import { mealService } from '@services/mealService';
import { useAuthStore } from '@store/authStore';
import { GenerationType, useGenerationStore } from '@store/generationStore';
import { useLocaleStore } from '@store/localeStore';
import { MainLayout } from '@templates/MainLayout';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function MealPlannerPage(): React.ReactElement {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { translate } = useLocaleStore();
  const { user } = useAuthStore();

  const { startGeneration } = useGenerationStore();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showRedirectModal, setShowRedirectModal] = useState<boolean>(false);
  const [showGenerationModal, setShowGenerationModal] = useState<boolean>(false);
  const {
    refresh: refreshSubscriptionStats,
    formatQuotaDisplay,
    getQuotaInfo,
  } = useSubscriptionStats();
  const { hasActiveGeneration: hasActiveMealGeneration } = useGenerationJob({
    type: GenerationType.MEAL,
    onComplete: () => {
      void loadMealPlan();
      void refreshSubscriptionStats();
    },
  });

  const loadMealPlan = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      const plan = await mealService.getCurrentPlan();
      setMealPlan(plan);
    } catch (err) {
      // No plan exists - check if user has required profile data
      if (!user?.age || !user?.gender || !user?.activityLevel) {
        setShowRedirectModal(true);
      }
      setError('');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadMealPlan();
  }, [loadMealPlan]);


  const handleOpenGenerationModal = (): void => {
    // Prevent multiple generations
    if (isGenerating || hasActiveMealGeneration) {
      showError(
        t('generation.alreadyGenerating') ||
          'Your trainer is already creating a plan. Please wait.',
      );
      return;
    }
    // Check subscription quota for AI generation
    if (quotaInfo?.isDepleted) {
      showError(t('subscription.limitReached'));
      return;
    }
    // Check if user has required data
    if (!user?.weight || !user?.height || !user?.age || !user?.gender || !user?.activityLevel) {
      setShowRedirectModal(true);
      return;
    }
    setShowGenerationModal(true);
  };

  const handleGeneratePlan = async (notes: string): Promise<void> => {
    try {
      setIsGenerating(true);
      setError('');

      const notesPayload = notes.trim() || undefined;
      // Start background generation
      const response = await mealService.generateMealPlan({ fullWeek: true, notes: notesPayload });

      if (response.jobId) {
        startGeneration(response.jobId, GenerationType.MEAL);
        showSuccess(t('generation.mealPlan') + ' ' + t('generation.generationStarted'));
        // Reload subscription stats after starting generation
        void refreshSubscriptionStats();
        setShowGenerationModal(false);
      }
    } catch (err) {
      setError('Failed to start meal plan generation');
      showError('Failed to start meal plan generation');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const formatNumber = (value: number): string => {
    if (!Number.isFinite(value)) {
      return '0';
    }
    return Math.round(value).toLocaleString();
  };

  const dayOrder: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  const orderedSchedule = mealPlan
    ? [...mealPlan.schedule].sort(
        (a, b) =>
          dayOrder.indexOf(a.dayOfWeek as DayOfWeek) - dayOrder.indexOf(b.dayOfWeek as DayOfWeek),
      )
    : [];

  const maintenanceCalories = mealPlan?.tdee ?? 0;
  const targetCalories = mealPlan?.dailyTargets.calories ?? 0;
  const calorieDelta = targetCalories - maintenanceCalories;

  if (isLoading) {
    return (
      <MainLayout>
        <MealPlannerSkeleton />
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b stickyyy top-0 bg-background z-10">
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
                  onClick={handleOpenGenerationModal}
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
        {/* No Plan Yet */}
        {!mealPlan && (
          <div className="text-center py-6 space-y-6">
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
                onClick={handleOpenGenerationModal}
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
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{t('meal.nutritionTargets')}</h2>

              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('meal.maintenanceIntake')}</p>
                    <p className="text-2xl font-bold">{formatNumber(maintenanceCalories)}</p>
                    <p className="text-xs text-muted-foreground">{t('meal.maintenanceCalories')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('meal.target')}</p>
                    <p className="text-2xl font-bold">{formatNumber(targetCalories)}</p>
                    <p className="text-xs text-muted-foreground">{t('meal.dailyGoal')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('meal.calorieDelta')}</p>
                    <p
                      className={`text-2xl font-bold ${
                        calorieDelta === 0
                          ? ''
                          : calorieDelta > 0
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                      }`}
                    >
                      {calorieDelta > 0 ? '+' : ''}
                      {formatNumber(calorieDelta)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calorieDelta === 0
                        ? t('meal.neutralIntake')
                        : calorieDelta > 0
                          ? t('meal.calorieSurplus')
                          : t('meal.calorieDeficit')}
                    </p>
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
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{t('meal.weeklyPlan')}</h2>

              {orderedSchedule.map((day: DailyMealPlan) => {
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
                                    <p className="font-medium text-sm">{translate(item.name)}</p>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {translate(item.description)}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.quantity}
                                    </p>
                                    {item.components && item.components.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        <p className="text-[11px] font-semibold text-foreground">
                                          {t('meal.ingredients')}
                                        </p>
                                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                                          {item.components.map((component, componentIndex) => {
                                            const componentNote = translate(component.notes);
                                            return (
                                              <li key={componentIndex} className="leading-relaxed">
                                                <span className="text-foreground">
                                                  {translate(component.name)} ·{' '}
                                                  <span className="font-medium">{component.quantity}</span>
                                                </span>
                                                {componentNote && (
                                                  <span className="block text-[10px] text-muted-foreground">
                                                    {componentNote}
                                                  </span>
                                                )}
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    )}
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

      {/* Redirect to Profile Modal */}
      <RedirectToProfileModal
        isOpen={showRedirectModal}
        onClose={(): void => setShowRedirectModal(false)}
        redirectDelay={3}
      />

      {/* Meal Plan Generation Modal */}
      <MealPlanGenerationModal
        isOpen={showGenerationModal}
        onClose={(): void => setShowGenerationModal(false)}
        onConfirm={handleGeneratePlan}
        isGenerating={isGenerating || hasActiveMealGeneration}
      />
    </MainLayout>
  );
}
