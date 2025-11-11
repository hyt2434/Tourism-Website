const BASE_URL = "http://127.0.0.1:5000/api/auth";

// Email/Password
export async function registerUser(userData) {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.error("Register Error:", err);
    return { error: "Network error" };
  }
}

export async function loginUser(userData) {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.error("Login Error:", err);
    return { error: "Network error" };
  }
}

// Google login
export function loginWithGoogle() {
  window.location.href = `${BASE_URL}/google`;
}

// Facebook login
export function loginWithFacebook() {
  window.location.href = `${BASE_URL}/facebook`;
}
