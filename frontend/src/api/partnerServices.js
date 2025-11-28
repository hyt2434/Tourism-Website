/**
 * API client for partner service management
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

// =====================================================================
// ACCOMMODATION SERVICES
// =====================================================================

export const accommodationAPI = {
  // Get cities
  getCities: async () => {
    const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/cities`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
  },

  // Get all accommodations
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/partner/accommodations`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch accommodations');
    return response.json();
  },

  // Get single accommodation
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch accommodation');
    return response.json();
  },

  // Create accommodation
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/accommodations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create accommodation');
    return response.json();
  },

  // Update accommodation
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update accommodation');
    return response.json();
  },

  // Delete accommodation
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete accommodation');
    return response.json();
  },

  // Room management
  rooms: {
    getAll: async (accommodationId) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${accommodationId}/rooms`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    },

    create: async (accommodationId, data) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${accommodationId}/rooms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create room');
      return response.json();
    },

    update: async (accommodationId, roomId, data) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${accommodationId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update room');
      return response.json();
    },

    delete: async (accommodationId, roomId) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/accommodations/${accommodationId}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete room');
      return response.json();
    },
  },
};

// =====================================================================
// RESTAURANT SERVICES
// =====================================================================

export const restaurantAPI = {
  // Get cities
  getCities: async () => {
    const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/cities`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
  },

  // Get all restaurants
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/partner/restaurants`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch restaurants');
    return response.json();
  },

  // Get single restaurant
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch restaurant');
    return response.json();
  },

  // Create restaurant
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/restaurants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create restaurant');
    return response.json();
  },

  // Update restaurant
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update restaurant');
    return response.json();
  },

  // Delete restaurant
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete restaurant');
    return response.json();
  },

  // Menu management
  menu: {
    getAll: async (restaurantId) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return response.json();
    },

    create: async (restaurantId, data) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create menu item');
      return response.json();
    },

    update: async (restaurantId, itemId, data) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update menu item');
      return response.json();
    },

    delete: async (restaurantId, itemId) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete menu item');
      return response.json();
    },
  },
};

// =====================================================================
// TRANSPORTATION SERVICES
// =====================================================================

export const transportationAPI = {
  // Get all vehicles
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/partner/transportation`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vehicles');
    return response.json();
  },

  // Get single vehicle
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/transportation/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vehicle');
    return response.json();
  },

  // Create vehicle
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/transportation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create vehicle');
    return response.json();
  },

  // Update vehicle
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/transportation/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update vehicle');
    return response.json();
  },

  // Delete vehicle
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/partner/transportation/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete vehicle');
    return response.json();
  },

  // Availability management
  availability: {
    get: async (vehicleId, startDate, endDate) => {
      const response = await fetch(
        `${API_BASE_URL}/api/partner/transportation/${vehicleId}/availability?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },

    set: async (vehicleId, data) => {
      const response = await fetch(`${API_BASE_URL}/api/partner/transportation/${vehicleId}/availability`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to set availability');
      return response.json();
    },
  },
};
