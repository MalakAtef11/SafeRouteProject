import axios from "axios";
import API_BASE from "./config";

// 📊 Get statistics
export const getAdminStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/Admin/stats`);
    return response.data;
  } catch (error) {
    console.error("Get Admin Stats Error:", error.response?.data || error.message);
    throw error;
  }
};

// 👥 Users Management
export const getAdminUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/Admin/users`);
    return response.data;
  } catch (error) {
    console.error("Get Admin Users Error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateAdminUser = async (userId, data) => {
  try {
    const response = await axios.put(`${API_BASE}/Admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error("Update Admin User Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdminUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE}/Admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Admin User Error:", error.response?.data || error.message);
    throw error;
  }
};

// 📋 Reports Management
export const getAdminReports = async () => {
  try {
    const response = await axios.get(`${API_BASE}/Admin/reports`);
    return response.data;
  } catch (error) {
    console.error("Get Admin Reports Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdminReport = async (reportId) => {
  try {
    const response = await axios.delete(`${API_BASE}/Admin/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Admin Report Error:", error.response?.data || error.message);
    throw error;
  }
};

// 🏢 Sectors Management
export const getAdminSectors = async () => {
  try {
    const response = await axios.get(`${API_BASE}/Admin/sectors`);
    return response.data;
  } catch (error) {
    console.error("Get Admin Sectors Error:", error.response?.data || error.message);
    throw error;
  }
};

export const createAdminSector = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/Admin/sectors`, data);
    return response.data;
  } catch (error) {
    console.error("Create Admin Sector Error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateAdminSector = async (sectorId, data) => {
  try {
    const response = await axios.put(`${API_BASE}/Admin/sectors/${sectorId}`, data);
    return response.data;
  } catch (error) {
    console.error("Update Admin Sector Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdminSector = async (sectorId) => {
  try {
    const response = await axios.delete(`${API_BASE}/Admin/sectors/${sectorId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Admin Sector Error:", error.response?.data || error.message);
    throw error;
  }
};

// 👥 Create User
export const createAdminUser = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/Admin/users`, data);
    return response.data;
  } catch (error) {
    console.error("Create Admin User Error:", error.response?.data || error.message);
    throw error;
  }
};

// 🤖 AI Prompt Management
export const getAdminPrompt = async () => {
  try {
    const response = await axios.get(`${API_BASE}/Admin/prompt`);
    return response.data;
  } catch (error) {
    console.error("Get Admin Prompt Error:", error.response?.data || error.message);
    throw error;
  }
};

export const saveAdminPrompt = async (promptText) => {
  try {
    const response = await axios.post(`${API_BASE}/Admin/prompt`, { prompt: promptText });
    return response.data;
  } catch (error) {
    console.error("Save Admin Prompt Error:", error.response?.data || error.message);
    throw error;
  }
};
