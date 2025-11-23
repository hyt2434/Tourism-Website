import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { User, Mail, Phone, Calendar, Camera, Edit, Lock, X } from "lucide-react";
import { getUserProfile, updateUserProfile, changeUserPassword } from "../api/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const { translations } = useLanguage();

  // Fetch user profile from database
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!storedUser || !storedUser.email) {
        console.log("No user found in localStorage");
        setLoading(false);
        return;
      }

      console.log("Fetching profile for:", storedUser.email);
      const data = await getUserProfile(storedUser.email);

      if (data && !data.error) {
        console.log("✅ Profile loaded from database:", data);
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
        });
        
        // Update localStorage with latest data from database
        const updatedUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          username: data.name, // Keep username for compatibility
          phone: data.phone,
          avatar: data.avatar,
          role: data.role,
          isLoggedIn: true
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        console.error("API error:", data.error);
        // Fallback to localStorage if API fails
        console.log("⚠️ Using localStorage fallback");
        setUser(storedUser);
        setFormData({
          name: storedUser.name || storedUser.username || "",
          email: storedUser.email || "",
          phone: storedUser.phone || "",
          avatar: storedUser.avatar || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        console.log("⚠️ Using localStorage fallback due to error");
        setUser(storedUser);
        setFormData({
          name: storedUser.name || storedUser.username || "",
          email: storedUser.email || "",
          phone: storedUser.phone || "",
          avatar: storedUser.avatar || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      // Validate email format if it's changed
      if (formData.email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setMessage({ type: "error", text: "Please enter a valid email address" });
          return;
        }
      }

      const data = await updateUserProfile(user.email, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
      });

      if (data && !data.error && data.user) {
        setUser(data.user);
        // Update localStorage
        const updatedUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          username: data.user.name,
          phone: data.user.phone,
          avatar: data.user.avatar,
          role: data.user.role,
          isLoggedIn: true
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
        
        setMessage({ type: "success", text: translations.updateSuccess || "Profile updated successfully!" });
        setShowEditModal(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: translations.passwordMismatch || "Passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: translations.invalidPassword || "Password must be at least 6 characters" });
      return;
    }

    try {
      const data = await changeUserPassword(user.email, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      if (data && !data.error) {
        setMessage({ type: "success", text: translations.passwordChangeSuccess || "Password changed successfully!" });
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return translations.notUpdated;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{translations.loading || "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-md ${
            message.type === "success" 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative">
                <img
                  src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-xl"
                />
                <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                  <Camera size={20} />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.name || translations.notUpdated}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <Calendar size={16} />
                {translations.memberSince || "Member since"}: {formatDate(user?.created_at)}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                    <Mail className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {translations.email}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium ml-11">
                  {user?.email || translations.notUpdated}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <Phone className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {translations.phone}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium ml-11">
                  {user?.phone || translations.notUpdated}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
              >
                <Edit size={20} />
                {translations.editProfile}
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
              >
                <Lock size={20} />
                {translations.changePassword}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20 pb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[75vh] overflow-y-auto my-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">{translations.editProfileTitle}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                  <img
                    src={formData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-700 mb-3"
                  />
                  <label className="cursor-pointer bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {translations.chooseImage}
                  </label>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {translations.fullName}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={translations.fullName}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {translations.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={translations.email}
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {translations.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={translations.phone}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
                >
                  {translations.cancel}
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  {translations.saveChanges}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20 pb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg my-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">{translations.changePasswordTitle}</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {translations.currentPassword}
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {translations.newPassword}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {translations.confirmPassword}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
                >
                  {translations.cancel}
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  {translations.changePassword}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
