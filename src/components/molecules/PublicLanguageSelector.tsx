import React from 'react';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { Language } from '@/types/enums';
import { useLocaleStore } from '@store/localeStore';

interface PublicLanguageSelectorProps {
  className?: string;
  triggerClassName?: string;
}

export function PublicLanguageSelector({
  className,
  triggerClassName,
}: PublicLanguageSelectorProps): React.ReactElement {
  const { language, setLanguage } = useLocaleStore();

  const languageOptions = [
    { value: Language.EN, label: '🇬🇧 English' },
    { value: Language.VI, label: '🇻🇳 Tiếng Việt' },
  ];

  return (
    <div
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className ?? ''}`}
    >
      <Globe className="h-4 w-4" />
      <Select value={language} onValueChange={(value): void => setLanguage(value as Language)}>
        <SelectTrigger className={`w-[140px] ${triggerClassName ?? ''}`}>
          <SelectValue />
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
  );
}

