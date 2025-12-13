// src/api.js
const BASE_URL = "http://127.0.0.1:5000/api/auth";

export async function registerUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Network error" };
  }
}

export async function loginUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Network error" };
  }
}

export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    console.error("Password Reset Request Error:", error);
    return { error: "Network error" };
  }
}

export async function resetPassword(data) {
  try {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Password Reset Error:", error);
    return { error: "Network error" };
  }
}

export async function getUserProfile(email) {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email,
      },
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Get Profile Error:", error);
    return { error: "Network error" };
  }
}

export async function updateUserProfile(email, profileData) {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email,
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    });
    return await response.json();
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "Network error" };
  }
}

export async function changeUserPassword(email, passwordData) {
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email,
      },
      credentials: "include",
      body: JSON.stringify(passwordData),
    });
    return await response.json();
  } catch (error) {
    console.error("Change Password Error:", error);
    return { error: "Network error" };
  }
}

export async function uploadUserAvatar(email, avatarData) {
  try {
    const response = await fetch(`${BASE_URL}/upload-avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email,
      },
      credentials: "include",
      body: JSON.stringify({ avatar: avatarData }),
    });
    return await response.json();
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    return { error: "Network error" };
  }
}

export async function setupPassword(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/setup-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error("Setup Password Error:", error);
    return { error: "Network error" };
  }
}