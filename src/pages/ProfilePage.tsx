import { ActivityLevel, DayOfWeek, ExperienceLevel, Gender, Goal } from '@/types/enums';
import { UserProfile } from '@/types/user';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { LanguageSelector } from '@organisms/LanguageSelector';
import { SubscriptionCard } from '@organisms/SubscriptionCard';
import { userService } from '@services/userService';
import { useAuthStore } from '@store/authStore';
import { MainLayout } from '@templates/MainLayout';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type CollapsibleSection = 'personal' | 'fitness' | 'schedule' | null;

export function ProfilePage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<CollapsibleSection>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserProfile>();

  useEffect(() => {
    if (user) {
      if (user.goal) setValue('goal', user.goal);
      if (user.experienceLevel) setValue('experienceLevel', user.experienceLevel);
      if (user.height) setValue('height', user.height);
      if (user.weight) setValue('weight', user.weight);
      if (user.targetWeight) setValue('targetWeight', user.targetWeight);
      if (user.age) setValue('age', user.age);
      if (user.gender) setValue('gender', user.gender);
      if (user.activityLevel) setValue('activityLevel', user.activityLevel);
      if (user.scheduleDays) setValue('scheduleDays', user.scheduleDays);
    }
  }, [user, setValue]);

  const onSubmit = async (data: UserProfile): Promise<void> => {
    try {
      setIsLoading(true);
      const updatedUser = await userService.updateProfile(data);
      updateUser(updatedUser);
      toast.success(t('profile.updateSuccess'));
    } catch (err) {
      toast.error(t('profile.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const goalOptions = [
    { value: Goal.MUSCLE_GAIN, label: t('profile.muscleGain') },
    { value: Goal.WEIGHT_LOSS, label: t('profile.weightLoss') },
    { value: Goal.MAINTENANCE, label: t('profile.maintenance') },
  ];

  const experienceLevelOptions = [
    { value: ExperienceLevel.BEGINNER, label: t('profile.beginner') },
    { value: ExperienceLevel.INTERMEDIATE, label: t('profile.intermediate') },
    { value: ExperienceLevel.ADVANCED, label: t('profile.advanced') },
  ];

  const genderOptions = [
    { value: Gender.MALE, label: t('profile.male') },
    { value: Gender.FEMALE, label: t('profile.female') },
    { value: Gender.OTHER, label: t('profile.other') },
  ];

  const activityLevelOptions = [
    { value: ActivityLevel.SEDENTARY, label: t('profile.sedentary'), description: t('profile.sedentaryDesc') },
    { value: ActivityLevel.LIGHTLY_ACTIVE, label: t('profile.lightlyActive'), description: t('profile.lightlyActiveDesc') },
    { value: ActivityLevel.MODERATELY_ACTIVE, label: t('profile.moderatelyActive'), description: t('profile.moderatelyActiveDesc') },
    { value: ActivityLevel.VERY_ACTIVE, label: t('profile.veryActive'), description: t('profile.veryActiveDesc') },
    { value: ActivityLevel.EXTREMELY_ACTIVE, label: t('profile.extremelyActive'), description: t('profile.extremelyActiveDesc') },
  ];

  const dayOptions = [
    { value: DayOfWeek.MONDAY, label: t('common.days.monday') },
    { value: DayOfWeek.TUESDAY, label: t('common.days.tuesday') },
    { value: DayOfWeek.WEDNESDAY, label: t('common.days.wednesday') },
    { value: DayOfWeek.THURSDAY, label: t('common.days.thursday') },
    { value: DayOfWeek.FRIDAY, label: t('common.days.friday') },
    { value: DayOfWeek.SATURDAY, label: t('common.days.saturday') },
    { value: DayOfWeek.SUNDAY, label: t('common.days.sunday') },
  ];

  const toggleSection = (section: CollapsibleSection): void => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <MainLayout>
      <div className="p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6 mb-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
            <div>
              <h3 className="font-semibold">{t('profile.language')}</h3>
              <p className="text-sm text-muted-foreground">{t('profile.changeLanguage')}</p>
            </div>
            <LanguageSelector />
          </div>

          {/* Subscription Card */}
          <SubscriptionCard />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information Section */}
            <div className="bg-card border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={(): void => toggleSection('personal')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
              >
                <h2 className="text-lg font-semibold">{t('profile.personalInfo')}</h2>
                {expandedSection === 'personal' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {expandedSection === 'personal' && (
                <div className="p-4 border-t space-y-4">
                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">
                        {t('profile.height')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        {...register('height', {
                          required: t('profile.errors.heightRequired'),
                          min: { value: 1, message: t('profile.errors.heightPositive') },
                        })}
                      />
                      {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">
                        {t('profile.weight')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        {...register('weight', {
                          required: t('profile.errors.weightRequired'),
                          min: { value: 1, message: t('profile.errors.weightPositive') },
                        })}
                      />
                      {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
                    </div>
                  </div>

                  {/* Target Weight */}
                  <div className="space-y-2">
                    <Label htmlFor="targetWeight">{t('profile.targetWeight')}</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      placeholder="65"
                      {...register('targetWeight', {
                        min: { value: 1, message: t('profile.errors.targetWeightPositive') },
                      })}
                    />
                    {errors.targetWeight && (
                      <p className="text-sm text-destructive">{errors.targetWeight.message}</p>
                    )}
                  </div>

                  {/* Age, Gender, Activity Level */}
                  <div className="space-y-2">
                    <Label htmlFor="age">{t('profile.age')}</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      {...register('age', {
                        min: { value: 1, message: t('profile.errors.agePositive') },
                        max: { value: 120, message: t('profile.errors.ageValid') },
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('profile.requiredForMealPlan')}
                    </p>
                    {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">{t('profile.gender')}</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }): React.ReactElement => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('profile.selectGender')} />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">{t('profile.requiredForTDEE')}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activityLevel">{t('profile.activityLevel')}</Label>
                      <Controller
                        name="activityLevel"
                        control={control}
                        render={({ field }): React.ReactElement => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('profile.selectActivity')} />
                            </SelectTrigger>
                            <SelectContent>
                              {activityLevelOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">{t('profile.requiredForTDEE')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fitness Goals Section */}
            <div className="bg-card border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={(): void => toggleSection('fitness')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
              >
                <h2 className="text-lg font-semibold">{t('profile.fitnessGoals')}</h2>
                {expandedSection === 'fitness' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {expandedSection === 'fitness' && (
                <div className="p-4 border-t space-y-4">
                  {/* Goal */}
                  <div className="space-y-2">
                    <Label htmlFor="goal">
                      {t('profile.goal')} <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="goal"
                      control={control}
                      rules={{ required: t('profile.errors.goalRequired') }}
                      render={({ field }): React.ReactElement => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('profile.selectGoal')} />
                          </SelectTrigger>
                          <SelectContent>
                            {goalOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.goal && <p className="text-sm text-destructive">{errors.goal.message}</p>}
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">
                      {t('profile.experienceLevel')} <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="experienceLevel"
                      control={control}
                      rules={{ required: t('profile.errors.experienceLevelRequired') }}
                      render={({ field }): React.ReactElement => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('profile.selectExperienceLevel')} />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevelOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.experienceLevel && (
                      <p className="text-sm text-destructive">{errors.experienceLevel.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Training Schedule Section */}
            <div className="bg-card border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={(): void => toggleSection('schedule')}
                className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
              >
                <h2 className="text-lg font-semibold">{t('profile.schedule')}</h2>
                {expandedSection === 'schedule' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {expandedSection === 'schedule' && (
                <div className="p-4 border-t space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        {t('profile.selectDays')} <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(): void => {
                          const currentDays = watch('scheduleDays') || [];
                          const allDays = Object.values(DayOfWeek);
                          const allSelected = allDays.length === currentDays.length;
                          
                          if (allSelected) {
                            setValue('scheduleDays', []);
                          } else {
                            setValue('scheduleDays', allDays);
                          }
                        }}
                      >
                        {((): string => {
                          const currentDays = watch('scheduleDays') || [];
                          const allDays = Object.values(DayOfWeek);
                          const allSelected = allDays.length === currentDays.length;
                          return allSelected ? t('workout.clearDays') : t('workout.selectAllDays');
                        })()}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {dayOptions.map((day) => (
                        <Controller
                          key={day.value}
                          name="scheduleDays"
                          control={control}
                          rules={{ required: t('profile.errors.selectAtLeastOneDay') }}
                          render={({ field }): React.ReactElement => {
                            const isSelected = field.value?.includes(day.value);
                            return (
                              <Button
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
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
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? t('common.loading') : t('profile.saveChanges')}
              </Button>
              <Button type="button" variant="outline" onClick={(): void => navigate('/')}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>

          {/* Logout Section (Moved to Bottom) */}
          <div className="pt-8 border-t">
            <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div>
                <h3 className="font-semibold text-destructive">{t('auth.logout')}</h3>
                <p className="text-sm text-muted-foreground">{t('auth.signOut')}</p>
              </div>
              <Button
                variant="destructive"
                onClick={(): void => {
                  clearAuth();
                  navigate('/login');
                }}
              >
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
