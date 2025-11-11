import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@atoms/Button';
import { FormField } from '@molecules/FormField';
import { useAuthStore } from '@store/authStore';
import { authService } from '@services/authService';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authService.register({
        email: data.email,
        password: data.password,
      });
      setAuth(response.accessToken, response.user);
      navigate('/onboarding');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">GigaFit</h1>
          <p className="text-muted-foreground mt-2">{t('auth.register')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <FormField
            label={t('auth.email')}
            name="email"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            register={register('email', { required: 'Email is required' })}
            required
          />

          <FormField
            label={t('auth.password')}
            name="password"
            type="password"
            error={errors.password?.message}
            register={register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
            required
          />

          <FormField
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            type="password"
            error={errors.confirmPassword?.message}
            register={register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value: string) => value === password || 'Passwords do not match',
            })}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.register')}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}

