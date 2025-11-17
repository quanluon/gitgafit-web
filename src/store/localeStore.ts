import { create } from 'zustand';
import { Language } from '@/types/enums';
import i18n from '../i18n/config';

interface LocaleState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  language: Language.VI,
  setLanguage: (language: Language): void => {
    i18n.changeLanguage(language);
    set({ language });
  },
}));

