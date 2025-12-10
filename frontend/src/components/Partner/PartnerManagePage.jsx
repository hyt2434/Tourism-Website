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
      setPartnerType(user.partnerType || null);
      setPartnerId(user.id);
      
      if (user.role !== "partner") {
        // Redirect to home if not partner
        navigate("/");
      } else {
        // Fetch statistics for partner
        fetchPartnerStats(user.id);
      }
    } else {
      // Redirect to login if not logged in
      navigate("/login");
    }
    setLoading(false);
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
      }
      
    } catch (error) {
      console.error('Error fetching partner stats:', error);
    }
  };

  // Helper function to check if a service type is allowed for this partner
  const canManageServiceType = (serviceType) => {
    if (!partnerType) return false; // If no partner type, don't allow any service
    
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
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              ← {t.partnerBackToDashboard || "Back to Dashboard"}
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentView === 'accommodations' && (t.serviceManagement?.accommodations || "Accommodations")}
              {currentView === 'restaurants' && (t.serviceManagement?.restaurants || "Restaurants")}
              {currentView === 'transportation' && (t.serviceManagement?.transportation || "Transportation")}
              {currentView === 'bookings' && (t.partnerViewBookings || "View Bookings")}
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
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
                    {partnerType && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t.partnerTypeLabel || "Partner Type"}: <span className="font-semibold text-blue-600 dark:text-blue-400">{getPartnerTypeDisplay()}</span>
                      </p>
                    )}
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



          {/* Main Content Grid - 3 cards on same line: My Services, View Bookings, Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Services Card - Conditionally show based on partner type */}
            {canManageServiceType('accommodation') && (
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerMyAccommodations || "My Accommodations"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerAccommodationsDesc || "Manage your hotels, resorts, and accommodation services"}
                </p>
                <button 
                  onClick={() => setCurrentView('accommodations')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerManageAccommodations || "Manage Accommodations"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            )}

            {canManageServiceType('transportation') && (
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerMyTransportation || "My Transportation"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerTransportationDesc || "Manage your vehicle fleet and transportation services"}
                </p>
                <button 
                  onClick={() => setCurrentView('transportation')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerManageTransportation || "Manage Transportation"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            )}

            {canManageServiceType('restaurant') && (
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t.partnerMyRestaurants || "My Restaurants"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalServices} {t.partnerTotal || "total"}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 min-h-[40px]">
                  {t.partnerRestaurantsDesc || "Manage your restaurants and dining services"}
                </p>
                <button 
                  onClick={() => setCurrentView('restaurants')}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                  <span>{t.partnerManageRestaurants || "Manage Restaurants"}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Bookings Card - Available to all partners */}
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
              <button 
                onClick={() => setCurrentView('bookings')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                <span>{t.partnerViewBookings || "View Bookings"}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>

            {/* Reviews Card - Available to all partners */}
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
              <button 
                onClick={() => navigate('/partner/reviews')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <span>{t.partnerViewReviews || "View Reviews"}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
