import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@atoms/Button';
import { FormField } from '@molecules/FormField';
import { useAuthStore } from '@store/authStore';
import { authService } from '@services/authService';
import { useLocaleStore } from '@store/localeStore';
import { Language } from '@/types/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { Globe } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { language, setLanguage } = useLocaleStore();
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
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || t('auth.loginError') || 'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const languageOptions = [
    { value: Language.EN, label: 'English' },
    { value: Language.VI, label: 'Tiếng Việt' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-end">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <Select value={language} onValueChange={(value): void => setLanguage(value as Language)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('profile.language')} />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
                message: t('errors.invalidEmail')
              }
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
                message: t('auth.passwordMinLength')
              }
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

