import React from 'react';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { useLocaleStore } from '@store/localeStore';
import { useAuthStore } from '@store/authStore';
import { userService } from '@services/userService';
import { Language } from '@/types/enums';
import toast from 'react-hot-toast';

export function LanguageSelector(): React.ReactElement {
  const { language, setLanguage } = useLocaleStore();
  const { updateUser } = useAuthStore();

  const languageOptions = [
    { value: Language.EN, label: '🇬🇧 English', short: 'EN' },
    { value: Language.VI, label: '🇻🇳 Tiếng Việt', short: 'VI' },
  ];

  const handleLanguageChange = async (newLanguage: Language): Promise<void> => {
    try {
      // Update language in local store first (immediate UI update)
      setLanguage(newLanguage);
      
      // Save to backend
      const updatedUser = await userService.updateProfile({ language: newLanguage } as never);
      updateUser(updatedUser);
    } catch (error) {
      console.error('Failed to update language:', error);
      toast.error('Failed to update language');
      // Revert on error
      setLanguage(language);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={language} 
        onValueChange={(value): void => {
          handleLanguageChange(value as Language);
        }}
      >
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

