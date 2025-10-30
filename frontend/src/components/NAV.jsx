import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";

export default function NAV() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("vi");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  const translations = {
    vi: {
      home: "Home",
      tour: "Tour",
      social: "Social",
      partner: "Partner",
      aboutus: "About us",
      admin: "Admin",
      login: "Đăng nhập",
      profile: "Thông tin cá nhân",
      logout: "Đăng xuất",
      account: "Tài khoản",
    },
    en: {
      home: "Home",
      tour: "Tour",
      social: "Social",
      partner: "Partner",
      aboutus: "About us",
      admin: "Admin",
      login: "Login",
      profile: "Profile",
      logout: "Logout",
      account: "Account",
    },
  };

  const t = translations[language];

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser");
      setIsLoggedIn(!!user);
    };

    const savedTheme = localStorage.getItem("theme");
    const savedLang = localStorage.getItem("language");

    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    if (savedLang) {
      setLanguage(savedLang);
    }

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target)
      ) {
        setShowLangDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfile = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setShowLangDropdown(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b shadow-sm transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-20 py-6">
        <div className="flex items-center justify-between">
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              textDecoration: "none",
            }}
            className="text-black dark:text-white transition-colors"
          >
            MagicViet
          </div>

          <div className="flex items-center gap-10 text-lg">
            <Link
              to="/"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.home}
            </Link>
            <Link
              to="/tour"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.tour}
            </Link>
            <Link
              to="/social"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.social}
            </Link>
            <Link
              to="/partner"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.partner}
            </Link>
            <Link
              to="/aboutus"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.aboutus}
            </Link>
            <Link
              to="/admin"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t.admin}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? (
                <DarkModeIcon className="text-yellow-400" />
              ) : (
                <LightModeIcon className="text-gray-700" />
              )}
            </button>

            {/* Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                title="Change Language"
              >
                <LanguageIcon className="text-black dark:text-white" />
                <span className="text-sm text-black dark:text-white uppercase">
                  {language}
                </span>
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => changeLanguage("vi")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                      language === "vi"
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                        : "text-black dark:text-white"
                    }`}
                  >
                    🇻🇳 Tiếng Việt
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                      language === "en"
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                        : "text-black dark:text-white"
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            {/* User Account */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg shadow hover:bg-gray-800 dark:hover:bg-gray-200 transition flex items-center justify-center"
                  title={t.account}
                >
                  <AccountCircleIcon fontSize="medium" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <button
                      onClick={handleProfile}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-black dark:text-white"
                    >
                      {t.profile}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-600 dark:text-red-400"
                    >
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg shadow hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
