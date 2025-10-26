import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function NAV() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('EN');
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Tour', path: '/tour' },
    { name: 'Social', path: '/social' },
    { name: 'Partner', path: '/partner' },
    { name: 'About us', path: '/aboutus' },
    { name: 'Admin', path: '/admin' }
  ];

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'VI' : 'EN');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="text-xl font-semibold text-title">
            MagicViet
          </div>

          {/* Desktop Navigation and Actions - Right Aligned */}
          <div className="hidden md:flex items-center gap-8">
            {/* Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-body hover:text-title hover:font-bold transition-all"
              >
                {item.name}
              </Link>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <MoonIcon className="h-5 w-5 text-title" />
              ) : (
                <SunIcon className="h-5 w-5 text-title" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Switch language"
            >
              <GlobeAltIcon className="h-5 w-5 text-title" />
              <span className="text-sm font-medium text-title">{language}</span>
            </button>

            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center gap-2"
                title="Đăng xuất"
              >
                <AccountCircleIcon fontSize="small" />
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-black text-white rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-title focus:outline-none focus:ring-2 focus:ring-black/20 rounded"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-body hover:text-title transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Dark Mode and Language */}
              <div className="flex items-center gap-2 px-2 py-2 border-t border-gray-200 mt-2 pt-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 flex-1 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <>
                      <MoonIcon className="h-5 w-5 text-title" />
                      <span className="text-sm text-title">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <SunIcon className="h-5 w-5 text-title" />
                      <span className="text-sm text-title">Light Mode</span>
                    </>
                  )}
                </button>

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 flex-1 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
                  aria-label="Switch language"
                >
                  <GlobeAltIcon className="h-5 w-5 text-title" />
                  <span className="text-sm font-medium text-title">{language}</span>
                </button>
              </div>

              {/* Mobile Login/Logout */}
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 px-4 py-2 bg-black text-white rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center justify-center gap-2"
                >
                  <AccountCircleIcon fontSize="small" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="mt-2 px-4 py-2 bg-black text-white rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20 block text-center" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
