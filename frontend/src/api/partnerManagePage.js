/**
 * API client for partner management page
 * Handles fetching partner statistics and revenue information
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || '';
  return {
    'Content-Type': 'application/json',
    'X-User-ID': userId,
  };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// =====================================================================
// PARTNER STATS & REVENUE
// =====================================================================

export const partnerStatsAPI = {
  /**
   * Get partner's monthly revenue
   * @param {number} partnerId - The partner's user ID
   * @returns {Promise<Object>} Response with monthly_revenue
   */
  getMonthlyRevenue: async (partnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/${partnerId}/revenue/monthly`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch monthly revenue');
    return response.json();
  },

  /**
   * Get partner's total services count based on their partner type
   * - For accommodation partners: total number of rooms across all accommodations
   * - For restaurant partners: total number of set meals across all restaurants
   * - For transportation partners: total number of vehicles (services)
   * @param {number} partnerId - The partner's user ID
   * @returns {Promise<Object>} Response with total_services and partner_type
   */
  getTotalServices: async (partnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/${partnerId}/stats`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch partner stats');
    return response.json();
  },

  /**
   * Get partner's active bookings count (confirmed bookings)
   * @param {number} partnerId - The partner's user ID
   * @returns {Promise<Object>} Response with active_bookings and partner_type
   */
  getActiveBookings: async (partnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/${partnerId}/bookings/active`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch active bookings');
    return response.json();
  },

  /**
   * Get all partner's revenue records
   * @param {number} partnerId - The partner's user ID
   * @returns {Promise<Object>} Response with revenues array and totals
   */
  getAllRevenue: async (partnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/${partnerId}/revenue`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch partner revenue');
    return response.json();
  },

  /**
   * Get all partner statistics at once
   * @param {number} partnerId - The partner's user ID
   * @returns {Promise<Object>} Combined stats object
   */
  getAllStats: async (partnerId) => {
    try {
      const [revenueData, statsData, bookingsData] = await Promise.all([
        partnerStatsAPI.getMonthlyRevenue(partnerId),
        partnerStatsAPI.getTotalServices(partnerId),
        partnerStatsAPI.getActiveBookings(partnerId),
      ]);

      return {
        success: true,
        monthlyRevenue: revenueData.monthly_revenue || 0,
        totalServices: statsData.total_services || 0,
        activeBookings: bookingsData.active_bookings || 0,
        partnerType: statsData.partner_type || null,
      };
    } catch (error) {
      console.error('Error fetching partner stats:', error);
      return {
        success: false,
        error: error.message,
        monthlyRevenue: 0,
        totalServices: 0,
        activeBookings: 0,
        partnerType: null,
      };
    }
  },
};

// =====================================================================
// PARTNER REVIEWS
// =====================================================================

/**
 * Get all reviews containing services belonging to a partner
 * @param {number} partnerId - The partner's user ID
 * @returns {Promise<Object>} Response with reviews array
 */
export const getPartnerReviews = async (partnerId) => {
  const response = await fetch(`${API_BASE_URL}/api/partner/${partnerId}/reviews`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch partner reviews');
  return response.json();
};
