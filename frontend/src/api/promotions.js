const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper to get user email from localStorage for authentication
const getUserEmail = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.email;
  }
  return null;
};

// Get all promotions (admin only)
export async function getAllPromotions() {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/promotions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch promotions");
  }

  return response.json();
}

// Get homepage promotions (public)
export async function getHomepagePromotions() {
  const response = await fetch(`${API_BASE_URL}/promotions/homepage`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch homepage promotions");
  }

  return response.json();
}

// Create a new promotion (admin only)
export async function createPromotion(promotionData) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
    body: JSON.stringify(promotionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create promotion");
  }

  return response.json();
}

// Update a promotion (admin only)
export async function updatePromotion(promotionId, promotionData) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
    body: JSON.stringify(promotionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update promotion");
  }

  return response.json();
}

// Delete a promotion (admin only)
export async function deletePromotion(promotionId) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete promotion");
  }

  return response.json();
}

// Validate and apply promotion code (public)
export async function validatePromotionCode(code, amount) {
  const response = await fetch(`${API_BASE_URL}/promotions/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to validate promotion code");
  }

  return response.json();
}

