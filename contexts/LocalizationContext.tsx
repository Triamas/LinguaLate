import React, { createContext, useContext, useState } from 'react';
import { translations, UILanguage } from '../translations';

interface LocalizationContextType {
  language: UILanguage;
  setLanguage: (lang: UILanguage) => void;
  t: typeof translations['en'];
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<UILanguage>('en');

  const setLanguage = (lang: UILanguage) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};