import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Configuration
 * 
 * Ensure EXPO_PUBLIC_API_BASE_URL is set in your .env file at the project root.
 * - Development (Emulator): http://10.0.2.2:5000
 * - Production (Railway): https://your-backend-name.up.railway.app
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.warn('EXPO_PUBLIC_API_BASE_URL is not defined in your .env file.');
}

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * Automatically attaches the JWT token to every request header
 */
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error retrieving token from storage:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Response Interceptor
 * Handles global 401 errors by clearing stored token.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - clearing token');
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    API.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: string) =>
    API.post('/auth/register', { name, email, password, role }),

  googleLogin: (accessToken: string, role: string = 'viewer') =>
    API.post('/auth/google-login', { accessToken, role }),

  getAllUsers: () => API.get('/auth/users'),
};

// ─── District Score Endpoints ────────────────────────────────────────────────

export const scoreAPI = {
  saveScore: (data: any) => API.post('/calculate/save', data),

  getAllScores: () => API.get('/calculate/all'),

  getScoreByDistrictId: (districtId: string) =>
    API.get(`/calculate/${districtId}`),

  deleteScoreByDistrictId: (districtId: string) =>
    API.delete(`/calculate/${districtId}`),
};

// ─── Weather & AI Diagnostic Endpoints ───────────────────────────────────────

export const weatherAPI = {
  analyzeDistrict: (districtName: string) =>
    API.get(`/weather/analyze/${districtName}`),
};

export default API;