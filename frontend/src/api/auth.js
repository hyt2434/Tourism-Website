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
