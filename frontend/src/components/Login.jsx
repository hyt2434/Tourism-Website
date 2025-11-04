import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext"; // 👈 import context

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
<<<<<<< HEAD
  const { t } = useLanguage(); // 👈 lấy t
=======
  const { translations } = useLanguage(); // 👈 lấy translations
>>>>>>> main

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginUser({ email, password });
      setIsLoading(false);

      if (result.message) {
        const currentUser = { email, username: result.user, isLoggedIn: true };
        localStorage.setItem("user", JSON.stringify(currentUser));
        window.dispatchEvent(new Event("storage"));
        navigate("/");
      } else {
<<<<<<< HEAD
        alert(result.error || t.loginError);
      }
    } catch (error) {
      setIsLoading(false);
      alert(t.networkError);
=======
        alert(result.error || translations.loginError);
      }
    } catch (error) {
      setIsLoading(false);
      alert(translations.networkError);
>>>>>>> main
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Close/Back Button */}
      <Link
        to="/"
        className="absolute top-6 right-6 p-2 rounded-full bg-white/80 dark:bg-gray-700 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-600 shadow-lg transition-all duration-300 hover:scale-110 z-10"
      >
        <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-white" />
      </Link>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">VN</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
<<<<<<< HEAD
            {t.loginTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 animate-fadeInUp border border-white/20">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-md group">
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-md group">
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Divider */}
=======
            {translations.loginTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {translations.loginSubtitle}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white/80 dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 dark:border-gray-600 transition-colors duration-300"
        >
          {/* Email */}
>>>>>>> main
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
              placeholder={t.emailPlaceholder}
=======
              placeholder={translations.emailPlaceholder}
>>>>>>> main
              required
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white/50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
              placeholder={t.passwordPlaceholder}
=======
              placeholder={translations.passwordPlaceholder}
>>>>>>> main
              required
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white/50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
<<<<<<< HEAD

          {/* Remember me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {t.rememberMe}
              </span>
            </label>
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {t.forgotPassword}
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? t.signingIn : t.signIn}
          </button>
=======
>>>>>>> main

          {/* Remember me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {translations.rememberMe}
              </span>
            </label>
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {translations.forgotPassword}
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? translations.signingIn : translations.signIn}
          </button>

          {/* Register */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
<<<<<<< HEAD
              {t.noAccount}{" "}
=======
              {translations.noAccount}{" "}
>>>>>>> main
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:underline dark:text-blue-400 font-semibold"
              >
<<<<<<< HEAD
                {t.signUp}
=======
                {translations.signUp}
>>>>>>> main
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

