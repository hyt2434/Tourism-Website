import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../api/auth";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  KeyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: code & new password
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { translations } = useLanguage();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await requestPasswordReset(email);
      setIsLoading(false);

      if (result.message) {
        setMessage(result.message);
        setStep(2);
      } else {
        setError(result.error || translations.resetRequestError);
      }
    } catch (error) {
      setIsLoading(false);
      setError(translations.networkError);
      console.error(error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(translations.passwordMismatch);
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setError(translations.passwordTooShort);
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({
        email,
        reset_code: resetCode,
        new_password: newPassword,
      });
      setIsLoading(false);

      if (result.message) {
        setMessage(result.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.error || translations.resetPasswordError);
      }
    } catch (error) {
      setIsLoading(false);
      setError(translations.networkError);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Close/Back Button */}
      <Link
        to="/login"
        className="absolute top-6 right-6 p-2 rounded-full bg-white/80 dark:bg-gray-700 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-600 shadow-lg transition-all duration-300 hover:scale-110 z-10"
      >
        <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-white" />
      </Link>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <KeyIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {step === 1 ? translations.forgotPasswordTitle : translations.resetPasswordTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {step === 1 ? translations.forgotPasswordSubtitle : translations.resetPasswordSubtitle}
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 dark:text-green-300 text-sm">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Request Reset Code */}
        {step === 1 && (
          <form
            onSubmit={handleRequestReset}
            className="bg-white/80 dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 dark:border-gray-600 transition-colors duration-300"
          >
            {/* Email */}
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translations.emailPlaceholder}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white/50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                {translations.resetCodeInfo}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? translations.sending : translations.sendResetCode}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                {translations.rememberPassword}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:underline dark:text-blue-400 font-semibold"
                >
                  {translations.backToLogin}
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Step 2: Enter Reset Code and New Password */}
        {step === 2 && (
          <form
            onSubmit={handleResetPassword}
            className="bg-white/80 dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 dark:border-gray-600 transition-colors duration-300"
          >
            {/* Reset Code */}
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder={translations.resetCodePlaceholder}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white/50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* New Password */}
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={translations.newPasswordPlaceholder}
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

            {/* Confirm Password */}
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={translations.confirmPasswordPlaceholder}
                required
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none bg-white/50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                {translations.passwordRequirements}
              </p>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <span className={newPassword.length >= 6 ? "text-green-600" : "text-gray-400"}>
                    {newPassword.length >= 6 ? "✓" : "○"}
                  </span>
                  <span>{translations.minCharacters}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className={newPassword === confirmPassword && newPassword ? "text-green-600" : "text-gray-400"}>
                    {newPassword === confirmPassword && newPassword ? "✓" : "○"}
                  </span>
                  <span>{translations.passwordsMatch}</span>
                </li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? translations.resetting : translations.resetPasswordButton}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                {translations.didntReceiveCode}{" "}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:underline dark:text-blue-400 font-semibold"
                >
                  {translations.resendCode}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
