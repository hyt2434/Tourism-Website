import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getAllBookings } from '../../api/bookings';
import { Calendar, User, Phone, Mail, DollarSign, TrendingUp, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';

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
        bg: '#dcfce7',
        darkBg: '#14532d',
        text: '#166534',
        darkText: '#86efac',
        icon: CheckCircle,
        label: t.bookingStatusConfirmed || 'Confirmed'
      },
      cancelled: {
        bg: '#fee2e2',
        darkBg: '#7f1d1d',
        text: '#991b1b',
        darkText: '#fca5a5',
        icon: XCircle,
        label: t.bookingStatusCancelled || 'Cancelled'
      },
      completed: {
        bg: '#dbeafe',
        darkBg: '#1e3a8a',
        text: '#1e40af',
        darkText: '#93c5fd',
        icon: CheckCircle,
        label: t.bookingStatusCompleted || 'Completed'
      }
    };

    const config = statusConfig[status] || {
      bg: '#f3f4f6',
      darkBg: '#1f2937',
      text: '#374151',
      darkText: '#d1d5db',
      icon: AlertCircle,
      label: status
    };

    const Icon = config.icon;

    return (
      <span 
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: config.bg,
          color: config.text
        }}
      >
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.bookingManagement || 'Booking Management'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.bookingManagementDesc || 'View and manage all tour bookings with platform revenue tracking'}
        </p>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="rounded-xl shadow-lg p-6 border"
          style={{
            backgroundColor: 'white',
            borderColor: '#e5e7eb'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {t.totalBookings || 'Total Bookings'}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                {bookings.length}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#dbeafe' }}
            >
              <Package className="w-6 h-6" style={{ color: '#2563eb' }} />
            </div>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-lg p-6 border"
          style={{
            backgroundColor: 'white',
            borderColor: '#e5e7eb'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {t.platformRevenue || 'Platform Revenue (10%)'}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#059669' }}>
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#d1fae5' }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: '#059669' }} />
            </div>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-lg p-6 border"
          style={{
            backgroundColor: 'white',
            borderColor: '#e5e7eb'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {t.confirmedBookings || 'Confirmed'}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#059669' }}>
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#d1fae5' }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: '#059669' }} />
            </div>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-lg p-6 border"
          style={{
            backgroundColor: 'white',
            borderColor: '#e5e7eb'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {t.completedBookings || 'Completed'}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2563eb' }}>
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#dbeafe' }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: '#2563eb' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: '#e5e7eb' }}>
        {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              filterStatus === status
                ? 'border-b-2'
                : ''
            }`}
            style={filterStatus === status ? {
              color: '#2563eb',
              borderColor: '#2563eb'
            } : {
              color: '#6b7280'
            }}
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
              <span 
                className="ml-2 px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                }}
              >
                {bookings.filter(b => b.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div 
          className="rounded-xl shadow-lg p-12 text-center border"
          style={{
            backgroundColor: 'white',
            borderColor: '#e5e7eb'
          }}
        >
          <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
          <p style={{ color: '#6b7280' }} className="text-lg">
            {t.noBookingsFound || 'No bookings found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow"
              style={{
                backgroundColor: 'white',
                borderColor: '#e5e7eb'
              }}
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
                  <div className="flex-grow space-y-4">
                    {/* Header with Status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#111827' }}>
                          {booking.tour_name}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                          Booking ID: #{booking.id}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#6b7280' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>
                          {booking.full_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: '#6b7280' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>
                          {booking.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" style={{ color: '#6b7280' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>
                          {booking.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: '#6b7280' }} />
                        <span className="text-sm" style={{ color: '#374151' }}>
                          {formatDate(booking.departure_date)}
                        </span>
                      </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: '#f9fafb' }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#6b7280' }}>
                            {t.totalPrice || 'Total Price'}
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#111827' }}>
                            {formatPrice(booking.total_price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#6b7280' }}>
                            {t.platformRevenue || 'Platform Revenue (10%)'}
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#059669' }}>
                            {formatPrice(booking.service_fee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#6b7280' }}>
                            {t.partnerPool || 'Partner Pool (90%)'}
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#2563eb' }}>
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
