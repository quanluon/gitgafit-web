import { useToast } from '@/hooks/useToast';
import { Language, LANGUAGE_OPTIONS } from '@/types/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@atoms/Select';
import { userService } from '@services/userService';
import { useAuthStore } from '@store/authStore';
import { useLocaleStore } from '@store/localeStore';
import React from 'react';

export function LanguageSelector(): React.ReactElement {
  const { language, setLanguage } = useLocaleStore();
  const { showError } = useToast();
  const { updateUser } = useAuthStore();

  const handleLanguageChange = async (newLanguage: Language): Promise<void> => {
    try {
      // Update language in local store first (immediate UI update)
      setLanguage(newLanguage);
      
      // Save to backend
      const updatedUser = await userService.updateProfile({ language: newLanguage } as never);
      updateUser(updatedUser);
    } catch (error) {
      console.error('Failed to update language:', error);
      showError('Failed to update language');
      // Revert on error
      setLanguage(language);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
