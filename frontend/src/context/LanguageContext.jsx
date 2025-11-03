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
