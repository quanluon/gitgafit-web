import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppRoutePath } from '@/routes/paths';
import { RedirectModal } from './RedirectModal';

interface RedirectToOnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  redirectDelay?: number;
}

export function RedirectToOnboardingModal({
  isOpen,
  onClose,
  redirectDelay = 3,
}: RedirectToOnboardingModalProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <RedirectModal
      isOpen={isOpen}
      onClose={onClose}
      redirectPath={AppRoutePath.Onboarding}
      redirectDelay={redirectDelay}
      title={t('onboarding.redirectModal.title')}
      message={t('onboarding.redirectModal.message', { seconds: redirectDelay })}
      goNowLabel={t('onboarding.redirectModal.goNow')}
    />
  );
}

