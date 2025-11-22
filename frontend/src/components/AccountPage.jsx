import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Calendar, Heart, Settings, Package, Clock, MapPin, Star } from "lucide-react";

export default function AccountPage() {
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    // Check if user is a client
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserRole(user.role);
      
      if (user.role !== "client") {
        // Redirect to home if not client
        navigate("/");
      }
    } else {
      // Redirect to login if not logged in
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "client") {
    return null;
  }

  const tabs = [
    { id: "bookings", name: "My Bookings", icon: Calendar },
    { id: "favorites", name: "Favorites", icon: Heart },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Account
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your bookings, favorites, and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-5 px-6 text-center border-b-3 font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "bookings" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="text-indigo-600" size={28} />
                    My Bookings
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* Sample Booking Card */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 shadow-md hover:shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Ha Long Bay Cruise Experience
                          </h3>
                          <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                            Confirmed
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Booking ID: #HLB-12345
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-3 bg-white dark:bg-gray-600 p-3 rounded-lg">
                        <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                          <p className="font-semibold text-gray-900 dark:text-white">Dec 25, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white dark:bg-gray-600 p-3 rounded-lg">
                        <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-semibold text-gray-900 dark:text-white">3 Days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white dark:bg-gray-600 p-3 rounded-lg">
                        <MapPin className="text-rose-600 dark:text-rose-400" size={20} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Guests</p>
                          <p className="font-semibold text-gray-900 dark:text-white">2 Adults</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium">
                        Cancel Booking
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Package className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={64} />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      No other bookings found
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Explore Tours
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart className="text-rose-600" size={28} />
                    Favorite Tours
                  </h2>
                </div>
                <div className="text-center py-20 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                  <Heart className="mx-auto text-rose-400 dark:text-rose-500 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start exploring and save your favorite tours!
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Discover Tours
                  </button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="text-gray-600 dark:text-gray-400" size={28} />
                    Account Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive booking confirmations and updates
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Marketing Emails */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          Marketing Emails
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive special offers and promotions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          SMS Notifications
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get text updates about your bookings
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 mt-8">
                    <h3 className="font-bold text-red-900 dark:text-red-400 text-lg mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="bg-red-600 text-white py-2.5 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
