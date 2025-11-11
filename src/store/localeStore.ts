import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '@/types/enums';
import i18n from '../i18n/config';

interface LocaleState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: Language.EN,
      setLanguage: (language: Language): void => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'locale-storage',
    },
  ),
);

