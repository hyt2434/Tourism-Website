const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Get all favorites for a user
export async function getUserFavorites(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch favorites");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
}

// Add a tour to favorites
export async function addFavorite(userId, tourId) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        tour_id: tourId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add favorite");
    }

    return response.json();
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
}

// Remove a tour from favorites
export async function removeFavorite(userId, tourId) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${userId}/${tourId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove favorite");
    }

    return response.json();
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}

// Check if a tour is favorited
export async function checkFavorite(userId, tourId) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/check/${userId}/${tourId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { success: false, is_favorite: false };
    }

    return response.json();
  } catch (error) {
    console.error("Error checking favorite:", error);
    return { success: false, is_favorite: false };
  }
}

