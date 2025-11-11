import { Translatable, Language } from '@/types/index';

export function getTranslation(text: Translatable, language: Language): string {
  return text[language];
}

