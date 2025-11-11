import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from '@/types/enums';
import en from './locales/en.json';
import vi from './locales/vi.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: Language.EN,
  fallbackLng: Language.EN,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

