import { useToast } from '@/hooks/useToast';
import { Button } from '@atoms/Button';
import { FormField } from '@molecules/FormField';
import { AuthLanguageSelector } from '@molecules/PublicLanguageSelector';
import { authService } from '@services/authService';
import { useAuthStore } from '@store/authStore';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      setAuth(response.accessToken, response.refreshToken, response.user);
      showSuccess(t('auth.loginSuccess'), { id: 'login-success' });
      navigate('/');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error?.response?.data?.message || t('auth.loginError') || 'Invalid email or password';
      showError(errorMessage, { id: 'login-error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <AuthLanguageSelector />

        <div className="text-center">
          <h1 className="text-3xl font-bold">GigaFit</h1>
          <p className="text-muted-foreground mt-2">{t('auth.login')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            label={t('auth.email')}
            name="email"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            register={register('email', {
              required: t('errors.required'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('errors.invalidEmail'),
              },
            })}
            required
          />

          <FormField
            label={t('auth.password')}
            name="password"
            type="password"
            error={errors.password?.message}
            register={register('password', {
              required: t('errors.required'),
              minLength: {
                value: 6,
                message: t('auth.passwordMinLength'),
              },
            })}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.login')}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t('auth.noAccount')} </span>
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
