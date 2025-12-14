import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { setupPassword } from "../api/auth";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const toast = useToast();

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email in URL, redirect to login
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await setupPassword(email, password);
      setIsLoading(false);

      if (result.message && result.user) {
        // Store user info including role and partnerType (if partner)
        const currentUser = {
          email: result.user.email,
          username: result.user.username,
          name: result.user.username,
          role: result.user.role,
          id: result.user.id,
          isLoggedIn: true,
        };

        // Add partnerType if user is a partner
        if (result.user.role === "partner" && result.user.partnerType) {
          currentUser.partnerType = result.user.partnerType;
        }

        localStorage.setItem("user", JSON.stringify(currentUser));

        // Store JWT token
        if (result.token) {
          localStorage.setItem("token", result.token);
          console.log("Token saved to localStorage");
        }

        window.dispatchEvent(new Event("storage"));

        toast.success("Password set successfully! You are now logged in.");

        // Redirect based on role
        if (result.user.role === "admin") {
          navigate("/admin");
        } else if (result.user.role === "partner") {
          navigate("/partner/manage");
        } else {
          navigate("/"); // client goes to home
        }
      } else {
        toast.error(result.error || "Failed to set password");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Network error");
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
            Set Up Your Password
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please create a password for your account
          </p>
          {email && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {email}
            </p>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSetupPassword}
          className="bg-white/80 dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 dark:border-gray-600 transition-colors duration-300"
        >
          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
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
              placeholder="Confirm your password"
              required
              minLength={6}
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
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-1">Password requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 6 characters long</li>
              <li>Use a combination of letters and numbers for better security</li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "Setting up..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

