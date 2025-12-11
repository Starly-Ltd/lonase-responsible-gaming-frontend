import { useState, useEffect, createContext, useContext } from "react";
import enTranslations from "../translations/en.json";
import frTranslations from "../translations/fr.json";

const TranslationContext = createContext();

export function TranslationProvider({ children, defaultLanguage = "fr" }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("rg_language") || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem("rg_language", language);
  }, [language]);

  const translations = {
    en: enTranslations,
    fr: frTranslations,
  };

  const t = (key, params = {}) => {
    const translation = translations[language]?.[key] || key;

    // Simple parameter replacement
    if (params && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(
          new RegExp(`\\{${paramKey}\\}`, "g"),
          params[paramKey]
        );
      }, translation);
    }

    return translation;
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    // Fallback if not in provider
    const translations = {
      en: enTranslations,
      fr: frTranslations,
    };
    const language = localStorage.getItem("rg_language") || "fr";
    return {
      t: (key, params = {}) => {
        const translation = translations[language]?.[key] || key;
        if (params && Object.keys(params).length > 0) {
          return Object.keys(params).reduce((str, paramKey) => {
            return str.replace(
              new RegExp(`\\{${paramKey}\\}`, "g"),
              params[paramKey]
            );
          }, translation);
        }
        return translation;
      },
      language,
      setLanguage: () => {},
    };
  }
  return context;
}
