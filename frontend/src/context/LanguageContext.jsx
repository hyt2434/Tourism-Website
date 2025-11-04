<<<<<<< HEAD
import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en';
import vi from '../locales/vi';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');

  const translations = {
    en,
    vi,
  };

  const t = translations[language] || translations.vi;

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
=======
import { createContext, useContext, useState } from "react";
import en from "../locales/en";
import vi from "../locales/vi";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("vi"); // 👈 mặc định là tiếng Việt

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "en" ? "vi" : "en"));
    };

    const translations = language === "en" ? en : vi;

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
>>>>>>> main
