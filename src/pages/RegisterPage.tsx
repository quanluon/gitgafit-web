import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@atoms/Button';
import { FormField } from '@molecules/FormField';
import { useAuthStore } from '@store/authStore';
import { authService } from '@services/authService';
import { PublicLanguageSelector } from '@molecules/PublicLanguageSelector';
import { AppRoutePath } from '@/routes/paths';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
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
      const response = await authService.register({
        email: data.email,
        password: data.password,
      });
      setAuth(response.accessToken, response.refreshToken, response.user);
      toast.success(t('auth.registerSuccess'));
      navigate(AppRoutePath.Onboarding);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || t('auth.registerError') || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="fixed top-4 right-4">
          <PublicLanguageSelector />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">GigaFit</h1>
          <p className="text-muted-foreground mt-2">{t('auth.register')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

