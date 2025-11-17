import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';
import { Label } from '@atoms/Label';
import { useToast } from '@/hooks/useToast';
import { submitFeedback } from '@/services/feedbackService';
import { logFeedbackEvent } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { FeedbackContext } from '@/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: FeedbackContext;
  path?: string;
}

const MAX_MESSAGE_LENGTH = 600;

export function FeedbackModal({
  isOpen,
  onClose,
  initialContext = FeedbackContext.GENERAL,
  path,
}: FeedbackModalProps): React.ReactElement | null {
  const { t, i18n } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { user } = useAuthStore();
  const [email, setEmail] = useState<string>(user?.email || '');
  const [context, setContext] = useState<FeedbackContext>(initialContext);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contextOptions = useMemo(
    () => [
      { value: FeedbackContext.GENERAL, label: t('feedback.contexts.general') },
      { value: FeedbackContext.WORKOUT, label: t('feedback.contexts.workout') },
      { value: FeedbackContext.MEAL, label: t('feedback.contexts.meal') },
      { value: FeedbackContext.INBODY, label: t('feedback.contexts.inbody') },
      { value: FeedbackContext.PROFILE, label: t('feedback.contexts.profile') },
      { value: FeedbackContext.OTHER, label: t('feedback.contexts.other') },
    ],
    [t],
  );

  if (!isOpen) {
    return null;
  }

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isSubmitDisabled = message.trim().length < 10 || message.length > MAX_MESSAGE_LENGTH || isSubmitting;

  const handleClose = (): void => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = (): void => {
    if (isSubmitDisabled) return;

    setIsSubmitting(true);

    const payload = {
      message: message.trim(),
      email: email.trim() || undefined,
      context,
      userId: user?._id,
      path,
      locale: i18n.language,
    };

    // Optimistic UX: close modal & notify immediately, then persist in background
    showSuccess(t('feedback.success'));
    setMessage('');
    setContext(initialContext);
    setEmail(user?.email || '');
    onClose();

    void submitFeedback(payload)
      .then(() => {
        logFeedbackEvent('feedback_submitted', { context, path });
      })
      .catch((error) => {
        console.error('Failed to send feedback', error);
        showError(t('feedback.error'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container border max-w-lg w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary">{t('feedback.betaBadge')}</p>
            <h2 className="text-2xl font-bold">{t('feedback.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('feedback.subtitle')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-email">
              {t('feedback.emailLabel')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </Label>
            <Input
              id="feedback-email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event): void => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-context">{t('feedback.contextLabel')}</Label>
            <select
              id="feedback-context"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={context}
              onChange={(event): void => setContext(event.target.value as FeedbackContext)}
            >
              {contextOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">{t('feedback.messageLabel')}</Label>
            <textarea
              id="feedback-message"
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t('feedback.placeholder') || ''}
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event): void => setMessage(event.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('feedback.messageHelper')}</span>
              <span>{remainingChars}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isSubmitting ? t('feedback.sending') : t('feedback.submit')}
          </Button>
          <Button variant="ghost" className="flex-1" onClick={handleClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

