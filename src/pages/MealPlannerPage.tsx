import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@atoms/Button';
import { MacrosCard } from '@molecules/MacrosCard';
import { MainLayout } from '@templates/MainLayout';
import { useAuthStore } from '@store/authStore';
import { mealService } from '@services/mealService';
import { MealPlan, DailyMealPlan, Meal } from '@/types/meal';
import { Language, MealType } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';

export function MealPlannerPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLocaleStore();
  const { user } = useAuthStore();

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async (): Promise<void> => {
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
  };

  const handleGeneratePlan = async (fullWeek = false, useAI = false): Promise<void> => {
    // Check if user has required data
    if (!user?.weight || !user?.height || !user?.age || !user?.gender || !user?.activityLevel) {
      setError('Please complete your profile first (age, gender, activity level required)');
      setTimeout(() => navigate('/profile'), 2000);
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      const plan = await mealService.generateMealPlan({ fullWeek, useAI });
      setMealPlan(plan);
    } catch (err) {
      setError('Failed to generate meal plan');
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
              <Button variant="ghost" size="icon" onClick={(): void => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{t('navigation.mealPlanner')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* No Plan Yet */}
        {!mealPlan && !isGenerating && (
          <div className="text-center py-12 space-y-6">
            <p className="text-muted-foreground">{t('meal.noMealPlan')}</p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button onClick={(): Promise<void> => handleGeneratePlan(true, true)} size="lg">
                {t('meal.aiFullWeek')}
              </Button>
              <Button onClick={(): Promise<void> => handleGeneratePlan(true, false)} size="lg" variant="outline">
                {t('meal.templateFullWeek')}
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('meal.generating')}</p>
          </div>
        )}

          {/* Meal Plan Display */}
        {mealPlan && !isGenerating && (
          <>
            {/* Regenerate Options */}
            <div className="flex gap-2 justify-end flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={(): Promise<void> => handleGeneratePlan(true, true)}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {t('meal.aiFullWeek')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(): Promise<void> => handleGeneratePlan(false, false)}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {t('meal.templateFullWeek')}
              </Button>
            </div>

            {/* TDEE & Macros Overview */}
            <div className="space-y-4">
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
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{t('meal.weeklyPlan')}</h2>

              {mealPlan.schedule.map((day: DailyMealPlan) => {
                const dayName =
                  day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1);
                const isExpanded = expandedDay === day.dayOfWeek;

                return (
                  <div key={day.dayOfWeek} className="bg-card border rounded-lg overflow-hidden">
                    {/* Day Header */}
                    <button
                      onClick={(): void =>
                        setExpandedDay(isExpanded ? null : day.dayOfWeek)
                      }
                      className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{dayName}</h3>
                        <span className="text-sm text-muted-foreground">
                          {day.meals.length} {t('meal.meals')}
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
                        {day.meals.map((meal: Meal, mealIndex: number) => (
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
                                    <p className="font-medium text-sm">
                                      {item.name[currentLang]}
                                    </p>
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

