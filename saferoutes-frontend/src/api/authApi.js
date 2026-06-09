import axios from "axios";
import API_BASE from "./config"; // 🔥 بجيب الرابط المحلي http://localhost:5029/api

// 🔐 تسجيل الدخول
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

// 📝 تسجيل جديد
export const registerUser = async (registerData) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/register`, registerData);
    return response.data;
  } catch (error) {
    console.error("Register Error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔵 Google login
export const googleLoginUser = async (credential) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/google-login`, {
      credential,
    });
    return response.data;
  } catch (error) {
    console.error("Google Login Error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔵 Facebook login
export const facebookLoginUser = async (accessToken) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/facebook-login`, {
      accessToken,
    });
    return response.data;
  } catch (error) {
    console.error("Facebook Login Error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔑 Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot Password Error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔐 Reset Password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    console.error("Reset Password Error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Verify Email
export const verifyEmail = async (token) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/verify-email`, { token });
    return response.data;
  } catch (error) {
    console.error("Verify Email Error:", error.response?.data || error.message);
    throw error;
  }
};

// 📧 Resend Verification
export const resendVerification = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/Auth/resend-verification`, { email });
    return response.data;
  } catch (error) {
    console.error("Resend Verification Error:", error.response?.data || error.message);
    throw error;
  }
};