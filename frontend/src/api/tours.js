/**
 * API client for Tour Management (Admin)
 * 
 * Provides functions for creating, reading, updating, and deleting tours,
 * as well as fetching available services filtered by destination city.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get authorization headers with user credentials
 */
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || '';
  const userEmail = user.email || '';
  return {
    'Content-Type': 'application/json',
    'X-User-ID': userId,
    'X-User-Email': userEmail,
  };
};

/**
 * Get all tours (admin only)
 */
export const getAllTours = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch tours');
    return response.json();
  } catch (error) {
    console.error('Error fetching tours:', error);
    throw error;
  }
};

/**
 * Get detailed tour information by ID
 */
export const getTourDetail = async (tourId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours/${tourId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Failed to fetch tour ${tourId}`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching tour ${tourId}:`, error);
    throw error;
  }
};

/**
 * Create a new tour
 */
export const createTour = async (tourData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tourData)
    });
    if (!response.ok) throw new Error('Failed to create tour');
    return response.json();
  } catch (error) {
    console.error('Error creating tour:', error);
    throw error;
  }
};

/**
 * Update an existing tour
 */
export const updateTour = async (tourId, tourData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours/${tourId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tourData)
    });
    if (!response.ok) throw new Error(`Failed to update tour ${tourId}`);
    return response.json();
  } catch (error) {
    console.error(`Error updating tour ${tourId}:`, error);
    throw error;
  }
};

/**
 * Delete a tour
 */
export const deleteTour = async (tourId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours/${tourId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Failed to delete tour ${tourId}`);
    return response.json();
  } catch (error) {
    console.error(`Error deleting tour ${tourId}:`, error);
    throw error;
  }
};

/**
 * Get available services filtered by destination city
 */
export const getAvailableServices = async (destinationCityId, departureCityId = null, serviceType = null) => {
  try {
    const params = new URLSearchParams({ destination_city_id: destinationCityId });
    
    if (departureCityId) {
      params.append('departure_city_id', departureCityId);
    }
    
    if (serviceType) {
      params.append('service_type', serviceType);
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/tours/available-services?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch available services');
    return response.json();
  } catch (error) {
    console.error('Error fetching available services:', error);
    throw error;
  }
};

/**
 * Calculate tour price based on selected services
 */
export const calculateTourPrice = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours/calculate-price`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to calculate tour price');
    return response.json();
  } catch (error) {
    console.error('Error calculating tour price:', error);
    throw error;
  }
};
