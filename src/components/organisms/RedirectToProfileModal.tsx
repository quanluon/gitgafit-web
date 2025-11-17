import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppRoutePath } from '@/routes/paths';
import { RedirectModal } from './RedirectModal';

interface RedirectToProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  redirectDelay?: number;
}

export function RedirectToProfileModal({
  isOpen,
  onClose,
  redirectDelay = 3,
}: RedirectToProfileModalProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <RedirectModal
      isOpen={isOpen}
      onClose={onClose}
      redirectPath={AppRoutePath.Profile}
      redirectDelay={redirectDelay}
      title={t('profile.redirectModal.title')}
      message={t('profile.redirectModal.message', { seconds: redirectDelay })}
      goNowLabel={t('profile.redirectModal.goNow')}
    />
  );
}

