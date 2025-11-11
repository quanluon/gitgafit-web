import React from 'react';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { useLocaleStore } from '@store/localeStore';
import { Language } from '@/types/enums';

export function LanguageSelector(): React.ReactElement {
  const { language, setLanguage } = useLocaleStore();

  const languageOptions = [
    { value: Language.EN, label: '🇬🇧 English', short: 'EN' },
    { value: Language.VI, label: '🇻🇳 Tiếng Việt', short: 'VI' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value): void => setLanguage(value as Language)}>
        <SelectTrigger className="w-[140px]">
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

