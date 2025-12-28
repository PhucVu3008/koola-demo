import axios from 'axios';

// Base URL can be overridden via env to point at Docker or remote backend.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. Error is 401 (Unauthorized)
    // 2. NOT currently on the login page
    // 3. NOT a login request itself
    // 4. NOT a change-password request (wrong password should show error, not redirect)
    if (
      error.response?.status === 401 && 
      !window.location.pathname.includes('/login') &&
      !error.config?.url?.includes('/sessions') &&
      !error.config?.url?.includes('/users/me/password')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
