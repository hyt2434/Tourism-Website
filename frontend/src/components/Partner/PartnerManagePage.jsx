import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { 
  Briefcase, Calendar, Star, TrendingUp, 
  Package, Clock, CheckCircle, AlertCircle, ArrowUpRight, Headphones
} from "lucide-react";
import AccommodationManagement from "../AccommodationManagement";
import RestaurantManagement from "../RestaurantManagement";
import TransportationManagement from "../TransportationManagement";
import ViewBookings from "./ViewBookings";
import { partnerStatsAPI } from "../../api/partnerManagePage";

export default function PartnerManagePage() {
  const navigate = useNavigate();
  const { translations: t } = useLanguage();
  const [userRole, setUserRole] = useState(null);
  const [partnerType, setPartnerType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, accommodations, restaurants, transportation, bookings
  const [partnerId, setPartnerId] = useState(null);

  // Statistics - fetched from API
  const [stats, setStats] = useState({
    totalServices: 0,
    activeBookings: 0,
  });


  useEffect(() => {
    // Check if user is a partner
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserRole(user.role);
      setUserName(user.username || "Partner");
      // Support both camelCase and snake_case keys from backend/localStorage
      setPartnerType(user.partnerType || user.partner_type || null);
      setPartnerId(user.id);
      
      if (user.role !== "partner") {
        // Redirect to home if not partner
        navigate("/");
        setLoading(false);
      } else {
        // Fetch statistics for partner
        fetchPartnerStats(user.id).finally(() => setLoading(false));
      }
    } else {
      // Redirect to login if not logged in
      navigate("/login");
      setLoading(false);
    }
  }, [navigate]);

  const fetchPartnerStats = async (partnerId) => {
    try {
      // Use the new API to fetch all stats at once
      const statsResult = await partnerStatsAPI.getAllStats(partnerId);
      
      if (statsResult.success) {
        setStats(prev => ({
          ...prev,
          totalServices: statsResult.totalServices,
          activeBookings: statsResult.activeBookings
        }));
        // If partnerType was missing from localStorage, fall back to API response
        if (!partnerType && statsResult.partnerType) {
          setPartnerType(statsResult.partnerType);
        }
      }
      
    } catch (error) {
      console.error('Error fetching partner stats:', error);
    }
  };

  // Helper function to check if a service type is allowed for this partner
  const canManageServiceType = (serviceType) => {
    // If we don't know the partner type yet, don't render any gated cards
    if (!partnerType) return false;
    
    // Map service types to partner types
    const serviceMapping = {
      'accommodation': 'accommodation',
      'transportation': 'transportation',
      'restaurant': 'restaurant',
      'tours': 'all', // All partners can manage tours
      'bookings': 'all', // All partners can view bookings
      'revenue': 'all', // All partners can view revenue
      'reviews': 'all' // All partners can view reviews
    };
    
    const requiredType = serviceMapping[serviceType];
    return requiredType === 'all' || requiredType === partnerType;
  };

  // Get partner type display name
  const getPartnerTypeDisplay = () => {
    const typeMap = {
      'accommodation': t.partnerTypeAccommodation || 'Accommodation',
      'transportation': t.partnerTypeTransportation || 'Transportation',
      'restaurant': t.partnerTypeRestaurant || 'Restaurant'
    };
    return typeMap[partnerType] || partnerType;
  };

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

  // Render service management component based on current view
  if (currentView !== 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-sm sm:text-base"
            >
              ← {t.partnerBackToDashboard || "Back to Dashboard"}
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {currentView === 'accommodations' && (t.serviceManagement?.accommodations || "Accommodations")}
              {currentView === 'restaurants' && (t.serviceManagement?.restaurants || "Restaurants")}
              {currentView === 'transportation' && (t.serviceManagement?.transportation || "Transportation")}
              {currentView === 'bookings' && (t.partnerViewBookings || "View Bookings")}
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {currentView === 'accommodations' && <AccommodationManagement />}
          {currentView === 'restaurants' && <RestaurantManagement />}
          {currentView === 'transportation' && <TransportationManagement />}
          {currentView === 'bookings' && <ViewBookings />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                      {t.partnerWelcome || "Welcome back"}, {userName}!
                    </h1>
                    {partnerType && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t.partnerTypeLabel || "Partner Type"}: <span className="font-semibold text-blue-600 dark:text-blue-400">{getPartnerTypeDisplay()}</span>
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 ml-0 sm:ml-14">
                  {t.partnerManageDesc || "Manage your services, bookings, and business operations"}
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                <button className="p-2.5 sm:p-3 bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group" title="Contact Support">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>

            </div>
          </div>



          {/* Main Content Grid - 3 cards on same line: My Services, View Bookings, Reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Services Card - Conditionally show based on partner type */}
            {canManageServiceType('accommodation') && (
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {t.partnerMyAccommodations || "My Accommodations"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2 min-h-[36px] sm:min-h-[40px]">
                  {t.partnerAccommodationsDesc || "Manage your hotels, resorts, and accommodation services"}
                </p>
                <button 
                  onClick={() => setCurrentView('accommodations')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span className="truncate">{t.partnerManageAccommodations || "Manage Accommodations"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                </button>
              </div>
            )}

            {canManageServiceType('transportation') && (
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {t.partnerMyTransportation || "My Transportation"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2 min-h-[36px] sm:min-h-[40px]">
                  {t.partnerTransportationDesc || "Manage your vehicle fleet and transportation services"}
                </p>
                <button 
                  onClick={() => setCurrentView('transportation')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span className="truncate">{t.partnerManageTransportation || "Manage Transportation"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                </button>
              </div>
            )}

            {canManageServiceType('restaurant') && (
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {t.partnerMyRestaurants || "My Restaurants"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2 min-h-[36px] sm:min-h-[40px]">
                  {t.partnerRestaurantsDesc || "Manage your restaurants and dining services"}
                </p>
                <button 
                  onClick={() => setCurrentView('restaurants')}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span className="truncate">{t.partnerManageRestaurants || "Manage Restaurants"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                </button>
              </div>
            )}

            {/* Bookings Card - Available to all partners */}
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {t.partnerBookings || "Bookings"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stats.activeBookings} {t.partnerActive || "active"}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2 min-h-[36px] sm:min-h-[40px]">
                {t.partnerBookingsDesc || "View and manage customer bookings"}
              </p>
              <button 
                onClick={() => setCurrentView('bookings')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                <span className="truncate">{t.partnerViewBookings || "View Bookings"}</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
              </button>
            </div>

            {/* Reviews Card - Available to all partners */}
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {t.partnerReviewsTitle || "Reviews"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stats.averageRating} {t.partnerAvgRating || "avg rating"}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2 min-h-[36px] sm:min-h-[40px]">
                {t.partnerReviewsDesc || "Manage customer reviews and ratings"}
              </p>
              <button 
                onClick={() => navigate('/partner/reviews')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <span className="truncate">{t.partnerViewReviews || "View Reviews"}</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
