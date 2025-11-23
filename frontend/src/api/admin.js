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

// Get all users (admin only)
export async function getAllUsers() {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch users");
  }

  return response.json();
}

// Update user role (admin only)
export async function updateUserRole(userId, newRole) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
    body: JSON.stringify({ role: newRole }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user role");
  }

  return response.json();
}

// Update user information (admin only)
export async function updateUser(userId, userData) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

// Update user status - ban/unban (admin only)
export async function updateUserStatus(userId, status) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user status");
  }

  return response.json();
}

// Reset user password (admin only)
export async function resetUserPassword(userId) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }

  return response.json();
}

// Delete user (admin only)
export async function deleteUser(userId) {
  const email = getUserEmail();
  
  if (!email) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }

  return response.json();
}
