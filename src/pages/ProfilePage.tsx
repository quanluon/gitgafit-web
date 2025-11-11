import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { MainLayout } from '@templates/MainLayout';
import { LanguageSelector } from '@organisms/LanguageSelector';
import { useAuthStore } from '@store/authStore';
import { userService } from '@services/userService';
import { Goal, ExperienceLevel, DayOfWeek, Gender, ActivityLevel } from '@/types/enums';
import { UserProfile } from '@/types/user';

export function ProfilePage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
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
      setError('');
      setSuccess('');
      const updatedUser = await userService.updateProfile(data);
      updateUser(updatedUser);
      setSuccess(t('profile.updateSuccess'));
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const goalOptions = [
    { value: Goal.MUSCLE_GAIN, label: 'Muscle Gain' },
    { value: Goal.WEIGHT_LOSS, label: 'Weight Loss' },
    { value: Goal.MAINTENANCE, label: 'Maintenance' },
  ];

  const experienceLevelOptions = [
    { value: ExperienceLevel.BEGINNER, label: 'Beginner' },
    { value: ExperienceLevel.INTERMEDIATE, label: 'Intermediate' },
    { value: ExperienceLevel.ADVANCED, label: 'Advanced' },
  ];

  const genderOptions = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
    { value: Gender.OTHER, label: 'Other' },
  ];

  const activityLevelOptions = [
    { value: ActivityLevel.SEDENTARY, label: 'Sedentary', description: 'Little or no exercise' },
    { value: ActivityLevel.LIGHTLY_ACTIVE, label: 'Lightly Active', description: '1-3 days/week' },
    { value: ActivityLevel.MODERATELY_ACTIVE, label: 'Moderately Active', description: '3-5 days/week' },
    { value: ActivityLevel.VERY_ACTIVE, label: 'Very Active', description: '6-7 days/week' },
    { value: ActivityLevel.EXTREMELY_ACTIVE, label: 'Extremely Active', description: 'Intense daily' },
  ];

  const dayOptions = [
    { value: DayOfWeek.MONDAY, label: 'Monday' },
    { value: DayOfWeek.TUESDAY, label: 'Tuesday' },
    { value: DayOfWeek.WEDNESDAY, label: 'Wednesday' },
    { value: DayOfWeek.THURSDAY, label: 'Thursday' },
    { value: DayOfWeek.FRIDAY, label: 'Friday' },
    { value: DayOfWeek.SATURDAY, label: 'Saturday' },
    { value: DayOfWeek.SUNDAY, label: 'Sunday' },
  ];

  return (
    <MainLayout>
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          <Button variant="ghost" onClick={(): void => navigate('/')}>
            {t('common.back')}
          </Button>
        </div>

        {/* Settings Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t('profile.settings')}</h2>
          
          {/* Language Selector */}
          <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
            <div>
              <h3 className="font-semibold">Language / Ngôn ngữ</h3>
              <p className="text-sm text-muted-foreground">Change app language</p>
            </div>
            <LanguageSelector />
          </div>

          {/* Logout Button */}
          <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
            <div>
              <h3 className="font-semibold">{t('auth.logout')}</h3>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="goal">
              {t('profile.goal')} <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="goal"
              control={control}
              rules={{ required: 'Goal is required' }}
              render={({ field }): React.ReactElement => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.goal ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your goal" />
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

          <div className="space-y-2">
            <Label htmlFor="experienceLevel">{t('profile.experienceLevel')} *</Label>
            <Controller
              name="experienceLevel"
              control={control}
              rules={{ required: 'Experience level is required' }}
              render={({ field }): React.ReactElement => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">{t('profile.height')} *</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                {...register('height', {
                  required: 'Height is required',
                  min: { value: 1, message: 'Height must be positive' },
                })}
              />
              {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">{t('profile.weight')} *</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                {...register('weight', {
                  required: 'Weight is required',
                  min: { value: 1, message: 'Weight must be positive' },
                })}
              />
              {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetWeight">{t('profile.targetWeight')}</Label>
            <Input
              id="targetWeight"
              type="number"
              placeholder="65"
              className={errors.targetWeight ? 'border-destructive' : ''}
              {...register('targetWeight', {
                min: { value: 1, message: 'Target weight must be positive' },
              })}
            />
            {errors.targetWeight && (
              <p className="text-sm text-destructive">{errors.targetWeight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">{t('profile.age')}</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              className={errors.age ? 'border-destructive' : ''}
              {...register('age', {
                min: { value: 1, message: 'Age must be positive' },
                max: { value: 120, message: 'Please enter a valid age' },
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
                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
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
                    <SelectTrigger className={errors.activityLevel ? 'border-destructive' : ''}>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {t('profile.scheduleDays')} <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(): void => {
                    setValue('scheduleDays', Object.values(DayOfWeek));
                  }}
                >
                  {t('workout.selectAllDays')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(): void => {
                    setValue('scheduleDays', []);
                  }}
                >
                  {t('workout.clearDays')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={(): void => navigate('/')}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </MainLayout>
  );
}

