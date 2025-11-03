import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLanguage } from "../context/LanguageContext";

export default function NAV() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { language, toggleLanguage, translations } = useLanguage();

  const navItems = [
    { name: translations.home, path: "/" },
    { name: translations.tour, path: "/tour" },
    { name: translations.social, path: "/social" },
    { name: translations.partner, path: "/partner" },
    { name: translations.about, path: "/aboutus" },
    { name: translations.admin, path: "/admin" },
  ];

  // ✅ Kiểm tra đăng nhập
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser");
      setIsLoggedIn(!!user);
    };
    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // ✅ Đóng dropdown khi click ngoài vùng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".account-dropdown")) {
        setShowDropdown(false);
      }
      if (!e.target.closest(".user-menu")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setUserMenuOpen(false);
    navigate("/");
  };

  // ✅ Chuyển dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-36">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="text-xl font-semibold text-title dark:text-white cursor-pointer mr-6 whitespace-nowrap"
            onClick={() => navigate("/")}
          >
            MagicViet
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-body dark:text-gray-300 hover:text-title dark:hover:text-white hover:font-bold transition-all whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <MoonIcon className="h-5 w-5 text-title dark:text-white" />
              ) : (
                <SunIcon className="h-5 w-5 text-title dark:text-white" />
              )}
            </button>

            {/* Language */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <GlobeAltIcon className="h-5 w-5 text-title dark:text-white" />
              <span className="text-sm font-medium text-title dark:text-white">
                {language.toUpperCase()}
              </span>
            </button>

            {/* 🔹 Login / User Section */}
            {/* Đăng nhập / Tài khoản */}
            {isLoggedIn ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/20"
                  title="User Menu"
                >
                  <AccountCircleIcon
                    className="text-title dark:text-white"
                    fontSize="medium"
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-body dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap"
                    >
                      {translations.profile}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-body dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap"
                    >
                      {translations.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                {translations.login}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-title dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors px-2 py-1 whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}

              {/* Login / User (Mobile) */}
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <AccountCircleIcon
                    fontSize="large"
                    className="text-title dark:text-white"
                  />
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 px-4 py-2 bg-black text-white rounded-full hover:opacity-90 block text-center whitespace-nowrap"
                >
                  {translations.login}
                </Link>
              )}
            </nav>
            <div className="relative account-dropdown">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-black text-white px-5 py-2 rounded-lg shadow hover:bg-gray-800 transition"
              >
                <AccountCircleIcon fontSize="medium" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 transition"
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
            ) : (
            <Link
              to="/login"
              className="bg-black text-white px-6 py-2 rounded-lg shadow hover:bg-gray-800 transition"
            >
              Đăng nhập
            </Link>
            )
          </div>
        )}
      </div>
    </header>
  );
}
