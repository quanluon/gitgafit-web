import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { useAuthStore } from '@store/authStore';
import { useGenerationStore, GenerationType } from '@store/generationStore';
import { workoutService } from '@services/workoutService';
import { userService } from '@services/userService';
import { Goal, ExperienceLevel, DayOfWeek } from '@/types/enums';
import { UserProfile } from '@/types/user';

type OnboardingStep = 'goal' | 'experience' | 'body' | 'schedule' | 'summary';

export function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { startGeneration, jobs } = useGenerationStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('goal');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if there's already a workout generation in progress
  const hasActiveWorkoutGeneration = jobs.some(
    (job) => job.type === GenerationType.WORKOUT && job.status === 'generating'
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
    { value: Goal.MUSCLE_GAIN, label: 'Build Muscle', description: 'Gain strength and size' },
    { value: Goal.WEIGHT_LOSS, label: 'Lose Weight', description: 'Burn fat and get lean' },
    { value: Goal.MAINTENANCE, label: 'Stay Fit', description: 'Maintain current fitness' },
  ];

  const experienceLevelOptions = [
    { value: ExperienceLevel.BEGINNER, label: 'Beginner', description: '0-1 year experience' },
    {
      value: ExperienceLevel.INTERMEDIATE,
      label: 'Intermediate',
      description: '1-3 years experience',
    },
    { value: ExperienceLevel.ADVANCED, label: 'Advanced', description: '3+ years experience' },
  ];

  const dayOptions = [
    { value: DayOfWeek.MONDAY, label: 'Mon' },
    { value: DayOfWeek.TUESDAY, label: 'Tue' },
    { value: DayOfWeek.WEDNESDAY, label: 'Wed' },
    { value: DayOfWeek.THURSDAY, label: 'Thu' },
    { value: DayOfWeek.FRIDAY, label: 'Fri' },
    { value: DayOfWeek.SATURDAY, label: 'Sat' },
    { value: DayOfWeek.SUNDAY, label: 'Sun' },
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
      toast.error(t('generation.alreadyGenerating') || 'A workout plan is already being generated');
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
      toast.error('Failed to start workout generation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
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
                <h2 className="text-2xl font-bold">What's your goal?</h2>
                <p className="text-muted-foreground">Choose your primary fitness objective</p>
              </div>

              <Controller
                name="goal"
                control={control}
                rules={{ required: 'Please select a goal' }}
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
                Continue
              </Button>
            </div>
          )}

          {/* Step: Experience */}
          {currentStep === 'experience' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Experience Level</h2>
                <p className="text-muted-foreground">How long have you been training?</p>
              </div>

              <Controller
                name="experienceLevel"
                control={control}
                rules={{ required: 'Please select experience level' }}
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
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={!formData.experienceLevel}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step: Body Metrics */}
          {currentStep === 'body' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Body Metrics</h2>
                <p className="text-muted-foreground">Help us personalize your plan</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={user?.height?.toString() || "175"}
                    {...register('height', {
                      required: 'Height is required',
                      min: { value: 1, message: 'Height must be positive' },
                    })}
                  />
                  {errors.height && (
                    <p className="text-sm text-destructive">{errors.height.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder={user?.weight?.toString() || "70"}
                    {...register('weight', {
                      required: 'Weight is required',
                      min: { value: 1, message: 'Weight must be positive' },
                    })}
                  />
                  {errors.weight && (
                    <p className="text-sm text-destructive">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder={user?.targetWeight?.toString() || "65"}
                  {...register('targetWeight', {
                    min: { value: 1, message: 'Target weight must be positive' },
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Set your goal weight for tracking
                </p>
                {errors.targetWeight && (
                  <p className="text-sm text-destructive">{errors.targetWeight.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={!formData.height || !formData.weight}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step: Schedule */}
          {currentStep === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Training Schedule</h2>
                <p className="text-muted-foreground">Which days can you train?</p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {dayOptions.map((day) => (
                    <Controller
                      key={day.value}
                      name="scheduleDays"
                      control={control}
                      rules={{ required: 'Select at least one day' }}
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
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={!formData.scheduleDays || formData.scheduleDays.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Ready to Start!</h2>
                <p className="text-muted-foreground">Review your information</p>
              </div>

              <div className="space-y-4 p-6 bg-secondary rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Goal</div>
                    <div className="font-semibold">
                      {goalOptions.find((o) => o.value === formData.goal)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Experience</div>
                    <div className="font-semibold">
                      {
                        experienceLevelOptions.find((o) => o.value === formData.experienceLevel)
                          ?.label
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Height</div>
                    <div className="font-semibold">{formData.height} cm</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Weight</div>
                    <div className="font-semibold">{formData.weight} kg</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Training Days</div>
                    <div className="font-semibold">
                      {formData.scheduleDays?.length || 0} days per week
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || hasActiveWorkoutGeneration}
                >
                  {isLoading || hasActiveWorkoutGeneration
                    ? t('generation.generating') || 'Generating...'
                    : t('generation.generatePlan') || 'Generate My Plan'}
                </Button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

