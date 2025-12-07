import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPartnerBookings } from '../../api/bookings';
import { Calendar, User, Phone, Mail, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ViewBookings() {
  const { translations: t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, confirmed, cancelled, completed

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const partnerId = user.id;
      
      if (!partnerId) {
        throw new Error('Partner ID not found');
      }

      const response = await getPartnerBookings(partnerId);
      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        throw new Error(response.message || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
        label: t.bookingStatusConfirmed || 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: XCircle,
        label: t.bookingStatusCancelled || 'Cancelled'
      },
      completed: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: CheckCircle,
        label: t.bookingStatusCompleted || 'Completed'
      }
    };

    const config = statusConfig[status] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-300',
      icon: AlertCircle,
      label: status
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadBookings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.retry || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.partnerViewBookings || 'View Bookings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.partnerViewBookingsDesc || 'Manage and view all bookings for your tours'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalBookings || 'Total Bookings'}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.confirmedBookings || 'Confirmed'}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.completedBookings || 'Completed'}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalRevenue || 'Total Revenue'}</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {formatPrice(bookings.reduce((sum, b) => sum + (b.service_revenue || 0), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                filterStatus === status
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                  {bookings.filter(b => b.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t.noBookingsFound || 'No bookings found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
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
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {booking.tour_name || t.tourName || 'Tour Name'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {booking.destination_city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.destination_city}</span>
                              </div>
                            )}
                            {booking.tour_duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{booking.tour_duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Customer Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t.customerInfo || 'Customer Information'}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p className="flex items-center gap-2">
                              <span className="font-medium">{booking.full_name}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {booking.email}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {booking.phone}
                            </p>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t.bookingDetails || 'Booking Details'}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                              <span className="font-medium">{t.departureDate || 'Departure'}:</span>{' '}
                              {formatDate(booking.departure_date)}
                            </p>
                            {booking.return_date && (
                              <p>
                                <span className="font-medium">{t.returnDate || 'Return'}:</span>{' '}
                                {formatDate(booking.return_date)}
                              </p>
                            )}
                            <p className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>
                                <span className="font-medium">{t.guests || 'Guests'}:</span>{' '}
                                {booking.number_of_guests || 1}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                <span className="font-medium">{t.totalPrice || 'Total'}:</span>{' '}
                                {formatPrice(booking.total_price || 0)}
                              </span>
                            </p>
                            {booking.payment_method && (
                              <p>
                                <span className="font-medium">{t.paymentMethod || 'Payment'}:</span>{' '}
                                {booking.payment_method}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{t.notes || 'Notes'}:</span> {booking.notes}
                          </p>
                        </div>
                      )}

                      {/* Revenue Breakdown */}
                      {booking.service_revenue !== undefined && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            {t.revenueBreakdown || 'Revenue Breakdown'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {t.bookingTotal || 'Booking Total'}
                              </p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatPrice(booking.total_price || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {t.partnerPool || 'Partner Pool (90%)'}
                              </p>
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(booking.partner_pool || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {t.yourRevenue || 'Your Revenue'}
                              </p>
                              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {formatPrice(booking.service_revenue || 0)}
                              </p>
                            </div>
                          </div>
                          {booking.partner_service_cost !== undefined && booking.total_service_costs > 0 && (
                            <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {t.revenueCalculation || 'Calculation'}: {formatPrice(booking.partner_pool || 0)} × ({formatPrice(booking.partner_service_cost)} / {formatPrice(booking.total_service_costs)}) = {formatPrice(booking.service_revenue || 0)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Booking Date */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t.bookingCreatedAt || 'Booking created'}: {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

