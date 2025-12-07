import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Calendar, Heart, Settings, Package, Clock, MapPin, Star, X, Eye, MessageSquare } from "lucide-react";
import { getUserBookings, getBookingDetails } from "../api/bookings";
import { getUserFavorites } from "../api/favorites";
import { checkCanReview } from "../api/reviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import TourReviewForm from "./TourReviewForm";

export default function AccountPage() {
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [bookingReviewStatus, setBookingReviewStatus] = useState({});

  useEffect(() => {
    // Check if user is a client
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserRole(user.role);
      setUserId(user.id);
      
      if (user.role !== "client") {
        // Redirect to home if not client
        navigate("/");
      } else {
        // Load bookings and favorites
        loadBookings(user.id);
        loadFavorites(user.id);
      }
    } else {
      // Redirect to login if not logged in
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  // Reload data when switching tabs
  useEffect(() => {
    if (userId && activeTab === "favorites") {
      loadFavorites(userId);
    } else if (userId && activeTab === "bookings") {
      loadBookings(userId);
    }
  }, [activeTab, userId]);

  const loadBookings = async (userId) => {
    setLoadingBookings(true);
    try {
      const result = await getUserBookings(userId);
      if (result.success) {
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadFavorites = async (userId) => {
    setLoadingFavorites(true);
    try {
      const result = await getUserFavorites(userId);
      if (result.success) {
        setFavorites(result.favorites || []);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleViewBookingDetail = async (bookingId) => {
    setLoadingDetail(true);
    setShowBookingDetail(true);
    try {
      const result = await getBookingDetails(bookingId);
      if (result.success) {
        setBookingDetail(result.booking);
      }
    } catch (error) {
      console.error("Failed to load booking details:", error);
      alert("Failed to load booking details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const checkBookingReviewStatus = async (bookingId) => {
    try {
      const result = await checkCanReview(bookingId);
      setBookingReviewStatus(prev => ({
        ...prev,
        [bookingId]: result
      }));
    } catch (error) {
      console.error("Failed to check review status:", error);
    }
  };

  const handleWriteReview = async (booking) => {
    // Check if can review first
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        alert('Please login to write a review');
        return;
      }

      console.log('Calling checkCanReview for booking:', booking.id);
      const result = await checkCanReview(booking.id);
      
      console.log('Can review result:', result);
      
      if (!result) {
        alert('Không nhận được phản hồi từ server');
        return;
      }
      
      if (result.success && result.can_review) {
        setReviewBooking({
          bookingId: booking.id,
          tourId: booking.tour_id,
          tourName: booking.tour_name
        });
        setShowReviewDialog(true);
      } else if (result.success && result.has_review) {
        alert('Bạn đã đánh giá tour này rồi');
      } else {
        alert(result.message || 'Bạn chưa thể đánh giá tour này');
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      alert('Không thể kiểm tra trạng thái đánh giá: ' + error.message);
    }
  };

  const handleReviewSuccess = (review) => {
    setShowReviewDialog(false);
    setReviewBooking(null);
    alert("Review submitted successfully!");
    // Refresh bookings to update review status
    if (userId) loadBookings(userId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "completed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{translations.loading}</p>
        </div>
      </div>
    );
  }

  if (userRole !== "client") {
    return null;
  }

  const tabs = [
    { id: "bookings", name: translations.accountPage.myBookings, icon: Calendar },
    { id: "favorites", name: translations.accountPage.favorites, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {translations.accountPage.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {translations.accountPage.subtitle}
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
                        ? "border-indigo-600 text-gray-700 dark:text-gray-300 bg-transparent"
                        : "border-transparent text-gray-500 hover:text-gray-700 bg-transparent dark:text-gray-400 dark:hover:text-gray-300"
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
                    {translations.accountPage.myBookings}
                  </h2>
                </div>
                {loadingBookings ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">{translations.loading}</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Package className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={64} />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {translations.accountPage.noOtherBookings}
                    </p>
                    <button
                      onClick={() => navigate("/tour")}
                      className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      {translations.exploreTours}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 shadow-md hover:shadow-xl"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {booking.tour_name || "Tour"}
                              </h3>
                              <span className={`${getStatusColor(booking.status)} text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 capitalize`}>
                                <span className={`w-2 h-2 rounded-full ${booking.status === "confirmed" ? "bg-green-600 animate-pulse" : booking.status === "cancelled" ? "bg-red-600" : "bg-blue-600"}`}></span>
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {translations.accountPage.bookingId}: #{booking.id}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-3 bg-white dark:bg-gray-600 p-3 rounded-lg">
                            <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{translations.accountPage.date}</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{formatDate(booking.departure_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white dark:bg-gray-600 p-3 rounded-lg">
                            <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{translations.accountPage.duration}</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{booking.tour_duration || "N/A"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white dark:bg-gray-600 p-3 rounded-lg">
                            <MapPin className="text-rose-600 dark:text-rose-400" size={20} />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{translations.guests}</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{booking.number_of_guests} {translations.people || "people"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewBookingDetail(booking.id)}
                            className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <Eye size={18} />
                            {translations.accountPage.viewDetails}
                          </button>
                          {booking.tour_schedule_status === 'completed' && (
                            <button
                              onClick={() => handleWriteReview(booking)}
                              className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              <MessageSquare size={18} />
                              Viết đánh giá
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart className="text-rose-600" size={28} />
                    {translations.accountPage.favoriteTours}
                  </h2>
                </div>
                {loadingFavorites ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">{translations.loading}</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-20 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                    <Heart className="mx-auto text-rose-400 dark:text-rose-500 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {translations.accountPage.noFavorites}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {translations.accountPage.startExploring}
                    </p>
                    <button
                      onClick={() => navigate("/tour")}
                      className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      {translations.accountPage.discoverTours}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                      <Link
                        key={favorite.id}
                        to={`/tour/${favorite.tour_id}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                      >
                        {favorite.tour.image && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={favorite.tour.image}
                              alt={favorite.tour.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {favorite.tour.name}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {favorite.tour.destination_city && (
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span>{favorite.tour.destination_city}</span>
                              </div>
                            )}
                            {favorite.tour.duration && (
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                <span>{favorite.tour.duration}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{translations.from}</p>
                              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {favorite.tour.total_price.toLocaleString("vi-VN")} {favorite.tour.currency || "đ"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={showBookingDetail} onOpenChange={setShowBookingDetail}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {translations.accountPage.bookingDetails}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {translations.accountPage.bookingId}: #{bookingDetail?.id}
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetail ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">{translations.loading}</p>
            </div>
          ) : bookingDetail ? (
            <div className="space-y-6 mt-4">
              {bookingDetail.tour_image && (
                <img
                  src={bookingDetail.tour_image}
                  alt={bookingDetail.tour_name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{bookingDetail.tour_name}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.fullName}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.email}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.phone}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.departureDate}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(bookingDetail.departure_date)}</p>
                  </div>
                  {bookingDetail.return_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.returnDate}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatDate(bookingDetail.return_date)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.duration}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.tour_duration || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.guests}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.number_of_guests} {translations.people || "people"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.totalPrice}</p>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-xl">
                      {bookingDetail.total_price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.paymentMethod}</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{bookingDetail.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.status}</p>
                    <span className={`inline-block ${getStatusColor(bookingDetail.status)} text-xs font-semibold px-3 py-1.5 rounded-full capitalize`}>
                      {bookingDetail.status}
                    </span>
                  </div>
                  {bookingDetail.promotion_code && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.accountPage.promotionCode}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.promotion_code}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {bookingDetail.destination_city && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{translations.destination}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{bookingDetail.destination_city}</p>
                </div>
              )}
              
              {bookingDetail.tour_description && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{translations.description}</p>
                  <p className="text-gray-700 dark:text-gray-300">{bookingDetail.tour_description}</p>
                </div>
              )}
              
              {bookingDetail.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{translations.accountPage.notes}</p>
                  <p className="text-gray-700 dark:text-gray-300">{bookingDetail.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-900 p-0">
          {reviewBooking && (
            <TourReviewForm
              bookingId={reviewBooking.bookingId}
              tourId={reviewBooking.tourId}
              onSuccess={handleReviewSuccess}
              onCancel={() => {
                setShowReviewDialog(false);
                setReviewBooking(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
