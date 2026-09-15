import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en', 'es'];
export const DEFAULT_LANGUAGE = 'en';

/**
 * Normaliza um locale cru (ex.: navigator.language, app.getLocale()) para um
 * dos idiomas suportados pelo app. Sem tradução disponível -> inglês.
 */
export const normalizeLanguage = (rawLocale) => {
  const lower = (rawLocale || '').toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('en')) return 'en';
  return DEFAULT_LANGUAGE;
};

export const getSystemLanguage = () => {
  const rawLocale =
    (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0])) || '';
  return normalizeLanguage(rawLocale);
};

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
    es: { translation: es }
  },
  lng: getSystemLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnEmptyString: false
});

export default i18n;
