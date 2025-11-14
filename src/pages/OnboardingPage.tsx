import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { useAuthStore } from '@store/authStore';
import { useGenerationStore, GenerationType, GenerationStatus } from '@store/generationStore';
import { workoutService } from '@services/workoutService';
import { userService } from '@services/userService';
import { Goal, ExperienceLevel, DayOfWeek } from '@/types/enums';
import { UserProfile } from '@/types/user';
import { useSubscriptionStats } from '@hooks/useSubscriptionStats';

type OnboardingStep = 'goal' | 'experience' | 'body' | 'schedule' | 'summary';

export function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { startGeneration, jobs } = useGenerationStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('goal');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { stats: subscriptionStats } = useSubscriptionStats();

  // Check if there's already a workout generation in progress
  const hasActiveWorkoutGeneration = jobs.some(
    (job) => job.type === GenerationType.WORKOUT && job.status === GenerationStatus.GENERATING,
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserProfile>();

  const formData = watch();

  // Pre-fill from user profile if available
  React.useEffect(() => {
    if (user) {
      if (user.goal) setValue('goal', user.goal);
      if (user.experienceLevel) setValue('experienceLevel', user.experienceLevel);
      if (user.height) setValue('height', user.height);
      if (user.weight) setValue('weight', user.weight);
      if (user.targetWeight) setValue('targetWeight', user.targetWeight);
      if (user.scheduleDays && user.scheduleDays.length > 0) {
        setValue('scheduleDays', user.scheduleDays);
      }
    }
  }, [user, setValue]);

  const goalOptions = [
    {
      value: Goal.MUSCLE_GAIN,
      label: t('onboarding.goalMuscleGain'),
      description: t('onboarding.goalMuscleGainDesc'),
    },
    {
      value: Goal.WEIGHT_LOSS,
      label: t('onboarding.goalWeightLoss'),
      description: t('onboarding.goalWeightLossDesc'),
    },
    {
      value: Goal.MAINTENANCE,
      label: t('onboarding.goalMaintenance'),
      description: t('onboarding.goalMaintenanceDesc'),
    },
  ];

  const experienceLevelOptions = [
    {
      value: ExperienceLevel.BEGINNER,
      label: t('onboarding.levelBeginner'),
      description: t('onboarding.levelBeginnerDesc'),
    },
    {
      value: ExperienceLevel.INTERMEDIATE,
      label: t('onboarding.levelIntermediate'),
      description: t('onboarding.levelIntermediateDesc'),
    },
    {
      value: ExperienceLevel.ADVANCED,
      label: t('onboarding.levelAdvanced'),
      description: t('onboarding.levelAdvancedDesc'),
    },
  ];

  const dayOptions = [
    { value: DayOfWeek.MONDAY, label: t('common.days.monday').slice(0, 3) },
    { value: DayOfWeek.TUESDAY, label: t('common.days.tuesday').slice(0, 3) },
    { value: DayOfWeek.WEDNESDAY, label: t('common.days.wednesday').slice(0, 3) },
    { value: DayOfWeek.THURSDAY, label: t('common.days.thursday').slice(0, 3) },
    { value: DayOfWeek.FRIDAY, label: t('common.days.friday').slice(0, 3) },
    { value: DayOfWeek.SATURDAY, label: t('common.days.saturday').slice(0, 3) },
    { value: DayOfWeek.SUNDAY, label: t('common.days.sunday').slice(0, 3) },
  ];

  const steps: OnboardingStep[] = ['goal', 'experience', 'body', 'schedule', 'summary'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = (): void => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = (): void => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const onSubmit = async (data: UserProfile): Promise<void> => {
    // Prevent multiple submissions
    if (isLoading || hasActiveWorkoutGeneration) {
      toast.error(t('generation.alreadyGenerating') || 'Your trainer is already creating a plan. Please wait.');
      return;
    }

    // Check subscription quota
    if (subscriptionStats && subscriptionStats.workout.remaining <= 0) {
      toast.error(t('subscription.limitReached'));
      return;
    }

    try {
      setIsLoading(true);

      // Update user profile
      const updatedUser = await userService.updateProfile(data);
      updateUser(updatedUser);

      // Start background workout generation
      const response = await workoutService.generatePlan({
        goal: data.goal,
        experienceLevel: data.experienceLevel,
        scheduleDays: data.scheduleDays,
        weight: data.weight,
        height: data.height,
        targetWeight: data.targetWeight,
      });

      // Start generation tracking in the floating bubble
      if (response.jobId) {
        startGeneration(response.jobId, GenerationType.WORKOUT);
        toast.success(t('generation.workoutPlan') + ' ' + t('generation.generationStarted'));
        // Navigate to home - user can continue using the app
        navigate('/');
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
      toast.error(t('onboarding.generationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-t-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {t('onboarding.step')} {currentStepIndex + 1} {t('onboarding.of')} {steps.length}
            </span>
            <div className="flex items-center gap-4">
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step: Goal */}
          {currentStep === 'goal' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{t('onboarding.goalTitle')}</h2>
                <p className="text-muted-foreground">{t('onboarding.goalDesc')}</p>
              </div>

              <Controller
                name="goal"
                control={control}
                rules={{ required: t('onboarding.selectGoalError') }}
                render={({ field }): React.ReactElement => (
                  <div className="space-y-3">
                    {goalOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          field.value === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={(): void => field.onChange(option.value)}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.goal && <p className="text-sm text-destructive">{errors.goal.message}</p>}

              <Button type="button" onClick={nextStep} className="w-full" disabled={!formData.goal}>
                {t('onboarding.continue')}
              </Button>
            </div>
          )}

          {/* Step: Experience */}
          {currentStep === 'experience' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{t('onboarding.experienceTitle')}</h2>
                <p className="text-muted-foreground">{t('onboarding.experienceDesc')}</p>
              </div>

              <Controller
                name="experienceLevel"
                control={control}
                rules={{ required: t('onboarding.selectExperienceError') }}
                render={({ field }): React.ReactElement => (
                  <div className="space-y-3">
                    {experienceLevelOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          field.value === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={(): void => field.onChange(option.value)}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  {t('onboarding.back')}
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={!formData.experienceLevel}
                >
                  {t('onboarding.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Body Metrics */}
          {currentStep === 'body' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{t('onboarding.bodyTitle')}</h2>
                <p className="text-muted-foreground">{t('onboarding.bodyDesc')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">{t('onboarding.heightLabel')} *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={user?.height?.toString() || '175'}
                    {...register('height', {
                      required: t('onboarding.heightRequired'),
                      min: { value: 1, message: t('onboarding.heightPositive') },
                    })}
                  />
                  {errors.height && (
                    <p className="text-sm text-destructive">{errors.height.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">{t('onboarding.weightLabel')} *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder={user?.weight?.toString() || '70'}
                    {...register('weight', {
                      required: t('onboarding.weightRequired'),
                      min: { value: 1, message: t('onboarding.weightPositive') },
                    })}
                  />
                  {errors.weight && (
                    <p className="text-sm text-destructive">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">{t('onboarding.targetWeightLabel')}</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder={user?.targetWeight?.toString() || '65'}
                  {...register('targetWeight', {
                    min: { value: 1, message: t('onboarding.targetWeightPositive') },
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.targetWeightHelper')}
                </p>
                {errors.targetWeight && (
                  <p className="text-sm text-destructive">{errors.targetWeight.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  {t('onboarding.back')}
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={!formData.height || !formData.weight}
                >
                  {t('onboarding.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Schedule */}
          {currentStep === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{t('onboarding.scheduleTitle')}</h2>
                <p className="text-muted-foreground">{t('onboarding.scheduleDesc')}</p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {dayOptions.map((day) => (
                    <Controller
                      key={day.value}
                      name="scheduleDays"
                      control={control}
                      rules={{ required: t('onboarding.selectDayError') }}
                      render={({ field }): React.ReactElement => {
                        const isSelected = field.value?.includes(day.value);
                        return (
                          <Button
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={(): void => {
                              const current = field.value || [];
                              const updated = isSelected
                                ? current.filter((d) => d !== day.value)
                                : [...current, day.value];
                              field.onChange(updated);
                            }}
                          >
                            {day.label}
                          </Button>
                        );
                      }}
                    />
                  ))}
                </div>
                {errors.scheduleDays && (
                  <p className="text-sm text-destructive">{errors.scheduleDays.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  {t('onboarding.back')}
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={!formData.scheduleDays || formData.scheduleDays.length === 0}
                >
                  {t('onboarding.continue')}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{t('onboarding.summaryTitle')}</h2>
                <p className="text-muted-foreground">{t('onboarding.summaryDesc')}</p>
              </div>

              <div className="space-y-4 p-6 bg-secondary rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t('onboarding.summaryGoal')}
                    </div>
                    <div className="font-semibold">
                      {goalOptions.find((o) => o.value === formData.goal)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t('onboarding.summaryExperience')}
                    </div>
                    <div className="font-semibold">
                      {
                        experienceLevelOptions.find((o) => o.value === formData.experienceLevel)
                          ?.label
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t('onboarding.summaryHeight')}
                    </div>
                    <div className="font-semibold">{formData.height} cm</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t('onboarding.summaryWeight')}
                    </div>
                    <div className="font-semibold">{formData.weight} kg</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">
                      {t('onboarding.summaryDays')}
                    </div>
                    <div className="font-semibold">
                      {formData.scheduleDays?.length || 0} {t('onboarding.daysPerWeek')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              {subscriptionStats && (
                <div className="text-sm text-center">
                  <span className="text-muted-foreground">
                    {t('subscription.workoutGenerations')}:{' '}
                  </span>
                  <span className={subscriptionStats.workout.remaining > 0 ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                    {subscriptionStats.workout.remaining} {t('subscription.remaining')}
                  </span>
                  <span className="text-muted-foreground">
                    {' '}/ {subscriptionStats.workout.limit === -1 ? t('subscription.unlimited') : subscriptionStats.workout.limit}
                  </span>
                </div>
              )}

              {subscriptionStats && subscriptionStats.workout.remaining <= 0 && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm text-center">
                  {t('subscription.upgradeToGenerate')}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  {t('onboarding.back')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    isLoading || 
                    hasActiveWorkoutGeneration || 
                    (subscriptionStats !== null && subscriptionStats.workout.remaining <= 0)
                  }
                >
                  {isLoading || hasActiveWorkoutGeneration
                    ? t('generation.generating')
                    : t('onboarding.generateMyPlan')}
                </Button>
              </div>
            </div>
          )}
        </form>
        <button
          type="button"
          onClick={(): void => navigate('/')}
          className="text-xs text-primary hover:underline text-end w-full"
        >
          {t('onboarding.skipNow')}
        </button>
      </div>
    </div>
  );
}
