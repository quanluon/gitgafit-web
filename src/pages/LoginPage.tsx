import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@atoms/Button';
import { FormField } from '@molecules/FormField';
import { useAuthStore } from '@store/authStore';
import { authService } from '@services/authService';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authService.login(data);
      setAuth(response.accessToken, response.refreshToken, response.user);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">GigaFit</h1>
          <p className="text-muted-foreground mt-2">{t('auth.login')}</p>
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
            register={register('password', { required: 'Password is required' })}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.login')}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}

