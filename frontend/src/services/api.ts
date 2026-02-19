import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second default timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Use sessionStorage for tab-independent sessions
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if user was previously authenticated (token exists)
    // This prevents redirecting on login failures
    if (error.response?.status === 401) {
      const token = sessionStorage.getItem('authToken');
      const currentPath = window.location.pathname;

      // Only redirect if:
      // 1. User had a valid token before (meaning session expired)
      // 2. They're not on the login/reset-password page already
      if (token && currentPath !== '/' && currentPath !== '/reset-password') {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
