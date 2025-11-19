import { Button } from '@atoms/Button';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export function NotificationPermissionModal({
  isOpen,
  onClose,
  onAllow,
}: NotificationPermissionModalProps): React.ReactElement | null {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">{t('notification.permissionTitle')}</h2>
        </div>

        <p className="text-muted-foreground">{t('notification.permissionMessage')}</p>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <p className="text-sm text-muted-foreground">{t('notification.benefit1')}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <p className="text-sm text-muted-foreground">{t('notification.benefit2')}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <p className="text-sm text-muted-foreground">{t('notification.benefit3')}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            {t('notification.notNow')}
          </Button>
          <Button onClick={onAllow} className="flex-1">
            {t('notification.allow')}
          </Button>
        </div>
      </div>
    </div>
  );
}

