const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitPartnerRegistration = async (registrationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-registrations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting partner registration:', error);
    throw error;
  }
};

export const getPendingPartnerRegistrations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-registrations/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pending registrations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending partner registrations:', error);
    throw error;
  }
};

export const approvePartnerRegistration = async (registrationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-registrations/${registrationId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error approving partner registration:', error);
    throw error;
  }
};

export const rejectPartnerRegistration = async (registrationId, reason) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-registrations/${registrationId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting partner registration:', error);
    throw error;
  }
};

export const getAllPartnerRegistrations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partner-registrations/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch all registrations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all partner registrations:', error);
    throw error;
  }
};
