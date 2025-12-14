import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getAllBookings } from '../../api/bookings';
import { Calendar, User, Phone, Mail, DollarSign, TrendingUp, CheckCircle, XCircle, AlertCircle, Package, Play, CheckSquare, Users } from 'lucide-react';

export default function BookingManagementTab() {
  const { translations: t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings();
      
      if (response.success) {
        setBookings(response.bookings || []);
        setTotalRevenue(response.total_revenue || 0);
      } else {
        throw new Error(response.message || (t.failedToLoadBookings || 'Failed to load bookings'));
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err.message || (t.failedToLoadBookings || 'Failed to load bookings'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        icon: CheckCircle,
        label: t.bookingStatusConfirmed || 'Confirmed',
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      },
      cancelled: {
        icon: XCircle,
        label: t.bookingStatusCancelled || 'Cancelled',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      },
      completed: {
        icon: CheckCircle,
        label: t.bookingStatusCompleted || 'Completed',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      }
    };

    const config = statusConfig[status] || {
      icon: AlertCircle,
      label: status,
      className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return t.notAvailable || 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadBookings}
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            {t.retry || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.bookingManagement || 'Booking Management'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t.bookingManagementDesc || 'View and manage all tour bookings with platform revenue tracking'}
        </p>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t.totalBookings || 'Total Bookings'}
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                {bookings.length}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t.platformRevenue || 'Platform Revenue (10%)'}
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1 truncate text-green-600 dark:text-green-400">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t.confirmedBookings || 'Confirmed'}
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t.completedBookings || 'Completed'}
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 bg-blue-100 dark:bg-blue-900/30">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
              filterStatus === status
                ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {status === 'all' 
              ? (t.allBookings || 'All')
              : status === 'confirmed'
              ? (t.confirmed || 'Confirmed')
              : status === 'completed'
              ? (t.completed || 'Completed')
              : (t.cancelled || 'Cancelled')
            }
            {status !== 'all' && (
              <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {bookings.filter(b => b.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-lg sm:rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {t.noBookingsFound || 'No bookings found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Tour Image */}
                  {booking.tour_image && (
                    <div className="flex-shrink-0">
                      <img
                        src={booking.tour_image}
                        alt={booking.tour_name}
                        className="w-full lg:w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-grow space-y-3 sm:space-y-4 min-w-0">
                    {/* Header with Status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold truncate text-gray-900 dark:text-white">
                          {booking.tour_name}
                        </h3>
                        <p className="text-xs sm:text-sm mt-1 text-gray-500 dark:text-gray-400">
                          {t.bookingId || 'Booking ID'}: #{booking.id}
                        </p>
                      </div>
                      <div className="flex-shrink-0">{getStatusBadge(booking.status)}</div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {booking.full_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {booking.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {booking.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(booking.departure_date)}
                        </span>
                      </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t.totalPrice || 'Total Price'}
                          </p>
                          <p className="text-lg font-bold mt-1 text-gray-900 dark:text-white">
                            {formatPrice(booking.total_price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t.platformRevenue || 'Platform Revenue (10%)'}
                          </p>
                          <p className="text-lg font-bold mt-1 text-green-600 dark:text-green-400">
                            {formatPrice(booking.service_fee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t.partnerPool || 'Partner Pool (90%)'}
                          </p>
                          <p className="text-lg font-bold mt-1 text-blue-600 dark:text-blue-400">
                            {formatPrice(booking.partner_pool)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
