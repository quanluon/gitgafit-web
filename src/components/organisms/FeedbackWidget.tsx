import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { FeedbackModal } from './FeedbackModal';
import { logFeedbackEvent } from '@/services/firebase';
import { FeedbackContext } from '@/types';

export function FeedbackWidget(): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const derivedContext = useMemo<FeedbackContext>(() => {
    if (location.pathname.includes('planner') || location.pathname.includes('workout')) {
      return FeedbackContext.WORKOUT;
    }
    if (location.pathname.includes('meal')) {
      return FeedbackContext.MEAL;
    }
    if (location.pathname.includes('inbody')) {
      return FeedbackContext.INBODY;
    }
    if (location.pathname.includes('profile')) {
      return FeedbackContext.PROFILE;
    }
    return FeedbackContext.GENERAL;
  }, [location.pathname]);

  const handleOpen = (): void => {
    logFeedbackEvent('feedback_opened', { path: location.pathname });
    setIsOpen(true);
  };

  const handleHide = (): void => {
    setIsOpen(false);
    setIsVisible(false);
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageCircle className="h-4 w-4" />
        {t('feedback.button')}
      </button>
      <button
        type="button"
        onClick={handleHide}
        className="fixed bottom-36 right-4 z-40 rounded-full bg-background/80 p-2 shadow-md border text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('common.close')}
      >
        <X className="h-4 w-4" />
      </button>
      <FeedbackModal
        isOpen={isOpen}
        onClose={(): void => setIsOpen(false)}
        initialContext={derivedContext}
        path={location.pathname}
      />
    </>
  );
}

