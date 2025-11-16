const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getCities = async () => {
  try {
    const response = await fetch(`${API_URL}/api/cities`);
    const data = await response.json();
    if (data.success) {
      return data.cities;
    }
    throw new Error(data.message || 'Failed to fetch cities');
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getCitiesByRegion = async (region) => {
  try {
    const response = await fetch(`${API_URL}/api/cities/region/${region}`);
    const data = await response.json();
    if (data.success) {
      return data.cities;
    }
    throw new Error(data.message || 'Failed to fetch cities');
  } catch (error) {
    console.error('Error fetching cities by region:', error);
    return [];
  }
};
