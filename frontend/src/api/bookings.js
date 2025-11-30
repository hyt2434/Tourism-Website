const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper to get user ID from localStorage
const getUserId = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.id;
  }
  return null;
};

// Get all bookings for current user
export async function getUserBookings(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch bookings");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

// Get booking details by ID
export async function getBookingDetails(bookingId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch booking details");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
}

// Get all bookings for a partner
export async function getPartnerBookings(partnerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/partner/${partnerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch partner bookings");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching partner bookings:", error);
    throw error;
  }
}

