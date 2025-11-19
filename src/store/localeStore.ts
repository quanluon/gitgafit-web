import { create } from 'zustand';
import { Language } from '@/types/enums';
import i18n from '../i18n/config';
import { LocalizedText } from '@/types';

interface LocaleState {
  language: Language;
  setLanguage: (language: Language) => void;
  translate<T = string>(localize?: LocalizedText<T>, defaultValue?: T): T;
}

export const useLocaleStore = create<LocaleState>()((set, get) => ({
  language: Language.VI,
  setLanguage: (language: Language): void => {
    i18n.changeLanguage(language);
    set({ language });
  },
  translate: <T = string>(localize?: LocalizedText<T>, defaultValue: T = '' as T): T => {
    if (!localize) return defaultValue;
    return localize[get().language] || localize.vi || localize.en;
  },
}));
