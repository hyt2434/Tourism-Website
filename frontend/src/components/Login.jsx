import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext"; // 👈 import context

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage(); // 👈 lấy t

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
        alert(result.error || t.loginError);
      }
    } catch (error) {
      setIsLoading(false);
      alert(t.networkError);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Close/Back Button */}
      <Link
        to="/"
        className="absolute top-6 right-6 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-300 hover:scale-110 z-10"
      >
        <XMarkIcon className="h-6 w-6 text-gray-700" />
      </Link>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center animate-fadeInDown">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
              <span className="text-3xl font-bold text-white">VN</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
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
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
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
              placeholder={t.passwordPlaceholder}
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

          {/* Toggle to Register */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t.noAccount}{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                {t.signUp}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-gray-500 animate-fadeIn">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}

