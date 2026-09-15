import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n, { SUPPORTED_LANGUAGES, getSystemLanguage } from '../i18n';
import { getUserSettings, saveUserSettings } from '../utils/userSettings';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [languageMode, setLanguageModeState] = useState(() => getUserSettings().languageMode);
  const [systemLanguage] = useState(getSystemLanguage);
  const resolvedLanguage = languageMode === 'auto' ? systemLanguage : languageMode;

  useEffect(() => {
    i18n.changeLanguage(resolvedLanguage);
    document.documentElement.lang = resolvedLanguage;
    window.electronAPI?.setAppLanguage?.(resolvedLanguage);
  }, [resolvedLanguage]);

  const setLanguageMode = (mode) => {
    const nextMode = ['auto', ...SUPPORTED_LANGUAGES].includes(mode) ? mode : 'auto';
    setLanguageModeState(nextMode);
    saveUserSettings({ ...getUserSettings(), languageMode: nextMode });
  };

  return (
    <LanguageContext.Provider
      value={{
        languageMode,
        setLanguageMode,
        resolvedLanguage,
        systemLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
