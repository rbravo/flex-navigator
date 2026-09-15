const ptBR = require('../locales/pt-BR.json');
const en = require('../locales/en.json');
const es = require('../locales/es.json');

const locales = { 'pt-BR': ptBR, en, es };
const DEFAULT_LOCALE = 'en';

let currentLocale = DEFAULT_LOCALE;

/**
 * Normaliza um locale cru (ex.: app.getLocale(), valor mandado pelo
 * renderer) para um dos idiomas suportados. Sem tradução disponível -> inglês.
 */
const normalizeLocale = (raw) => {
  const lower = (raw || '').toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
};

const setLocale = (raw) => {
  currentLocale = normalizeLocale(raw);
};

const getLocale = () => currentLocale;

const lookup = (dict, key) =>
  key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);

/**
 * Tradução simples por chave "a.b.c", com interpolação {{var}} e fallback
 * pt-BR -> en -> a própria chave. Usado pelo menu nativo e pelos diálogos do
 * auto-updater, que rodam no processo principal (sem acesso ao i18next do
 * renderer).
 */
const t = (key, vars) => {
  const template =
    lookup(locales[currentLocale], key) ?? lookup(locales[DEFAULT_LOCALE], key) ?? key;

  if (typeof template !== 'string' || !vars) return template;

  return Object.keys(vars).reduce(
    (result, varName) => result.replaceAll(`{{${varName}}}`, vars[varName]),
    template
  );
};

module.exports = { setLocale, getLocale, normalizeLocale, t };
