import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  Calendar, 
  Play, 
  CheckSquare, 
  Users, 
  XCircle, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';

export default function ScheduleManagementTab() {
  const { translations: t, language } = useLanguage();
  const toast = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSchedules();
  }, [statusFilter]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = statusFilter === 'all' 
        ? 'http://localhost:5000/api/schedules/summary'
        : `http://localhost:5000/api/schedules/summary?status=${statusFilter}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(t.failedToLoadSchedules || 'Failed to load schedules');
      }

      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules);
      } else {
        throw new Error(data.message || (t.failedToLoadSchedules || 'Failed to load schedules'));
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
      setError(err.message || (t.failedToLoadSchedules || 'Failed to load schedules'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartTour = async (scheduleId) => {
    if (!confirm(t.confirmStartTour || 'Are you sure you want to start this tour? This will mark it as ongoing.')) {
      return;
    }

    try {
      setActionLoading(scheduleId);
      
      const response = await fetch(`http://localhost:5000/api/schedules/${scheduleId}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(t.tourStartedSuccess || 'Tour started successfully!');
        loadSchedules();
      } else {
        throw new Error(data.message || (t.failedToStartTour || 'Failed to start tour'));
      }
    } catch (err) {
      console.error('Error starting tour:', err);
      toast.error(err.message || (t.failedToStartTour || 'Failed to start tour'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTour = async (scheduleId) => {
    if (!confirm(t.confirmCompleteTour || 'Are you sure you want to complete this tour? This will distribute revenue to partners.')) {
      return;
    }

    try {
      setActionLoading(scheduleId);
      
      const response = await fetch(`http://localhost:5000/api/schedules/${scheduleId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        const message = (t.tourCompletedSuccess || 'Tour completed! Revenue distributed: {amount}').replace('{amount}', formatPrice(data.total_revenue_distributed));
        toast.success(message);
        loadSchedules();
      } else {
        throw new Error(data.message || (t.failedToCompleteTour || 'Failed to complete tour'));
      }
    } catch (err) {
      console.error('Error completing tour:', err);
      toast.error(err.message || (t.failedToCompleteTour || 'Failed to complete tour'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTour = async (scheduleId) => {
    if (!confirm(t.confirmCancelTour || 'Are you sure you want to cancel this tour? All bookings will be cancelled and refunded.')) {
      return;
    }

    try {
      setActionLoading(scheduleId);
      
      const response = await fetch(`http://localhost:5000/api/schedules/${scheduleId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        const message = (t.tourCancelledSuccess || 'Tour cancelled. {count} bookings refunded.').replace('{count}', data.cancelled_bookings_count);
        toast.success(message);
        loadSchedules();
      } else {
        throw new Error(data.message || (t.failedToCancelTour || 'Failed to cancel tour'));
      }
    } catch (err) {
      console.error('Error cancelling tour:', err);
      toast.error(err.message || (t.failedToCancelTour || 'Failed to cancel tour'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        text: t.pending || 'Pending',
        icon: AlertCircle
      },
      ongoing: { 
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        text: t.onGoing || 'On Going',
        icon: Play
      },
      completed: { 
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        text: t.bookingStatusCompleted || 'Completed',
        icon: CheckSquare
      },
      cancelled: { 
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        text: t.bookingStatusCancelled || 'Cancelled',
        icon: XCircle
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </div>
    );
  };

  const getOccupancyColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (percentage >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

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
            onClick={loadSchedules}
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            {t.retry || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total: schedules.length,
    pending: schedules.filter(s => s.status === 'pending').length,
    ongoing: schedules.filter(s => s.status === 'ongoing').length,
    completed: schedules.filter(s => s.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.tourScheduleManagement || 'Tour Schedule Management'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.scheduleManagementDesc || 'Manage tour schedules, start tours, and distribute revenue to partners'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalSchedules || 'Total Schedules'}</p>
              <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.pending || 'Pending'}</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.onGoing || 'On Going'}</p>
              <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.ongoing}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.bookingStatusCompleted || 'Completed'}</p>
              <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30">
              <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['all', 'pending', 'ongoing', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              statusFilter === status
                ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {status === 'all' 
              ? (t.allSchedules || 'All Schedules')
              : status === 'pending'
              ? (t.pending || 'Pending')
              : status === 'ongoing'
              ? (t.onGoing || 'On Going')
              : (t.bookingStatusCompleted || 'Completed')
            }
            {status !== 'all' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {stats[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg text-gray-600 dark:text-gray-400">{t.noSchedulesFound || 'No schedules found'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const canCancel = schedule.occupancy_percentage < 50 && schedule.status === 'pending';
            const canStart = schedule.status === 'pending' && schedule.booking_count > 0;
            const canComplete = schedule.status === 'ongoing';

            return (
              <div
                key={schedule.schedule_id}
                className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {schedule.tour_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t.scheduleId || 'Schedule ID'}: #{schedule.schedule_id}
                      </p>
                    </div>
                    {getStatusBadge(schedule.status)}
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.departure || 'Departure'}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {formatDate(schedule.departure_datetime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.return || 'Return'}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {formatDate(schedule.return_datetime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.capacity || 'Capacity'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {schedule.slots_booked} / {schedule.max_slots} {t.slots || 'slots'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.occupancy || 'Occupancy'}</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold mt-1 ${getOccupancyColor(schedule.occupancy_percentage)}`}>
                        {schedule.occupancy_percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Booking Count Info */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.totalBookings || 'Total Bookings'}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {schedule.booking_count} {schedule.booking_count !== 1 ? (t.bookings || 'bookings') : (t.booking || 'booking')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {canStart && (
                      <button
                        onClick={() => handleStartTour(schedule.schedule_id)}
                        disabled={actionLoading === schedule.schedule_id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        {actionLoading === schedule.schedule_id ? (t.starting || 'Starting...') : (t.startTour || 'Start Tour')}
                      </button>
                    )}

                    {canComplete && (
                      <button
                        onClick={() => handleCompleteTour(schedule.schedule_id)}
                        disabled={actionLoading === schedule.schedule_id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckSquare className="w-4 h-4" />
                        {actionLoading === schedule.schedule_id ? (t.completing || 'Completing...') : (t.completeTour || 'Complete Tour')}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancelTour(schedule.schedule_id)}
                        disabled={actionLoading === schedule.schedule_id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        {actionLoading === schedule.schedule_id ? (t.cancelling || 'Cancelling...') : (t.cancelTour || 'Cancel Tour (Low Occupancy)')}
                      </button>
                    )}

                    {!canStart && !canComplete && !canCancel && schedule.status === 'pending' && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {t.waitingForBookings || 'Waiting for bookings...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
