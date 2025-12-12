const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getPartnersSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/api/partners/summary`);
  if (!response.ok) throw new Error('Failed to fetch partners summary');
  return response.json();
};

export const getPartnerDetail = async (partnerId) => {
  const response = await fetch(`${API_BASE_URL}/api/partners/${partnerId}/detail`);
  if (!response.ok) throw new Error('Failed to fetch partner detail');
  return response.json();
};

