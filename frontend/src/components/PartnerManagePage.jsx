import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { 
  Briefcase, Calendar, DollarSign, Star, TrendingUp, 
  Package, Clock, CheckCircle, AlertCircle, ArrowUpRight, Headphones
} from "lucide-react";

export default function PartnerManagePage() {
  const navigate = useNavigate();
  const { translations: t } = useLanguage();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // Mock statistics - in production, fetch from API
  const [stats, setStats] = useState({
    totalServices: 12,
    activeBookings: 28,
    monthlyRevenue: 15420,
    averageRating: 4.8,
    totalReviews: 156,
    responseRate: 98,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "booking", message: "New booking for Beach Resort", time: "2 hours ago", status: "pending" },
    { id: 2, type: "review", message: "New 5-star review received", time: "5 hours ago", status: "success" },
    { id: 3, type: "payment", message: "Payment received $450", time: "1 day ago", status: "success" },
    { id: 4, type: "update", message: "Service updated: Mountain Villa", time: "2 days ago", status: "info" },
  ]);

  useEffect(() => {
    // Check if user is a partner
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserRole(user.role);
      setUserName(user.username || "Partner");
      
      if (user.role !== "partner") {
        // Redirect to home if not partner
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userRole !== "partner") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t.partnerWelcome || "Welcome back"}, {userName}!
                    </h1>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg ml-15">
                  {t.partnerManageDesc || "Manage your services, bookings, and business operations"}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group" title="Contact Support">
                  <Headphones className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>

            </div>
          </div>

          {/* Stats Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Services */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>12%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.totalServices}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.partnerTotalServices || "Total Services"}</p>
              </div>
            </div>

            {/* Active Bookings */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>8%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.activeBookings}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.partnerActiveBookings || "Active Bookings"}</p>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>24%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  ${stats.monthlyRevenue.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.partnerMonthlyRevenue || "Monthly Revenue"}</p>
              </div>
            </div>

            {/* Average Rating */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>0.3</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.averageRating}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.partnerAverageRating || "Average Rating"} ({stats.totalReviews} {t.partnerReviews || "reviews"})</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Management Cards - 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr">
              {/* Services Card */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerMyServices || "My Services"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerMyServicesDesc || "Manage your tours, accommodations, and transport services"}
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerManageServices || "Manage Services"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Bookings Card */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerBookings || "Bookings"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.activeBookings} {t.partnerActive || "active"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerBookingsDesc || "View and manage customer bookings"}
                </p>
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerViewBookings || "View Bookings"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Revenue Card */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerRevenue || "Revenue"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.partnerThisMonth || "This month"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerRevenueDesc || "Track your earnings and financial reports"}
                </p>
                <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerViewRevenue || "View Revenue"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Reviews Card */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerReviewsTitle || "Reviews"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.averageRating} {t.partnerAvgRating || "avg rating"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerReviewsDesc || "Manage customer reviews and ratings"}
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerViewReviews || "View Reviews"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recent Activity - 1 column */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.partnerRecentActivity || "Recent Activity"}</h3>
                <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">
                  {t.partnerViewAll || "View All"}
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {activity.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      {activity.status === 'pending' && <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      {activity.status === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
