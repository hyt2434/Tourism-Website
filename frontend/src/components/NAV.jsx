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
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { language, toggleLanguage, translations } = useLanguage();

  // All navigation items with role restrictions
  const allNavItems = [
    {
      name: translations.home,
      path: "/",
      roles: ["admin", "partner", "client"],
      public: true,
    },
    {
      name: translations.tour,
      path: "/tour",
      roles: ["admin", "partner", "client"],
      public: true,
    },
    {
      name: translations.social,
      path: "/social",
      roles: ["admin", "partner", "client"],
      public: true,
    },
    {
      name: translations.partner,
      path: "/partner",
      roles: ["admin", "partner", "client"],
      public: true,
    },
    {
      name: translations.about,
      path: "/aboutus",
      roles: ["admin", "partner", "client"],
      public: true,
    },
    { name: "Admin", path: "/admin", roles: ["admin"], public: false },
    { name: translations.partnerManagePage || "Partner Manage", path: "/partner/manage", roles: ["partner"], public: false },
    { name: translations.myAccount, path: "/account", roles: ["client"], public: false },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter((item) => {
    if (!userRole) return item.public; // Show only public items when not logged in
    return item.roles.includes(userRole);
  });

  // ✅ Kiểm tra đăng nhập và role
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(user.role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
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
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserMenuOpen(false);
    navigate("/");
  };

  // ✅ Chuyển dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-[10000] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="text-lg sm:text-xl font-semibold text-title dark:text-white cursor-pointer mr-2 sm:mr-4 md:mr-6 whitespace-nowrap flex-shrink-0"
            onClick={() => navigate("/")}
          >
            MagicViet
          </div>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-wrap">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm xl:text-base text-body dark:text-gray-300 hover:text-title dark:hover:text-white hover:font-bold transition-all whitespace-nowrap text-center py-2 px-2 xl:px-3"
              >
                {item.name}
              </Link>
            ))}

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-self-center"
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
              className="flex items-center gap-1 px-2 xl:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap justify-center"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <GlobeAltIcon className="h-4 w-4 xl:h-5 xl:w-5 text-title dark:text-white" />
              <span className="text-xs xl:text-sm font-medium text-title dark:text-white hidden xl:inline">
                {language.toUpperCase()}
              </span>
            </button>

            <div className="w-auto xl:w-28 flex-shrink-0">
              {/* Login / User Section */}
              {isLoggedIn ? (
                <div className="relative user-menu justify-self-center">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/20"
                    title="User Menu"
                  >
                    <AccountCircleIcon
                      className="text-title dark:text-white "
                      fontSize="medium"
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-[10001]">
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
                  className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap text-center"
                >
                  {translations.login}
                </Link>
              )}
            </div>
          </div>
          {/* Mobile/Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-title dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-black/20"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                {/* Dark Mode (Mobile) */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <MoonIcon className="h-5 w-5 text-title dark:text-white" />
                  ) : (
                    <SunIcon className="h-5 w-5 text-title dark:text-white" />
                  )}
                </button>

                {/* Language (Mobile) */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <GlobeAltIcon className="h-5 w-5 text-title dark:text-white" />
                  <span className="text-sm font-medium text-title dark:text-white">
                    {language.toUpperCase()}
                  </span>
                </button>
              </div>

              {/* Login / User (Mobile) */}
              {isLoggedIn ? (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <AccountCircleIcon
                      fontSize="medium"
                      className="text-title dark:text-white"
                    />
                    <span className="text-sm text-body dark:text-gray-300">
                      {translations.profile || "Profile"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400"
                  >
                    <span className="text-sm">{translations.logout || "Logout"}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-center whitespace-nowrap"
                >
                  {translations.login}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
