import { Language, LANGUAGE_OPTIONS } from '@/types/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { useLocaleStore } from '@store/localeStore';
import React from 'react';

interface PublicLanguageSelectorProps {
  className?: string;
  triggerClassName?: string;
}
export function PublicLanguageSelector({
  className,
  triggerClassName,
}: PublicLanguageSelectorProps): React.ReactElement {
  const { language, setLanguage } = useLocaleStore();

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className ?? ''}`}>
      <Select value={language} onValueChange={(value): void => setLanguage(value as Language)}>
        <SelectTrigger className={`w-[140px] ${triggerClassName ?? ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function AuthLanguageSelector(): React.ReactElement {
  return (
    <div className="fixed top-10 right-4">
      <PublicLanguageSelector />
    </div>
  );
}
