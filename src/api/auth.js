import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('popcorn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const registerUser = (data) => API.post('/auth', { ...data, action: 'register' });
export const loginUser = (data) => API.post('/auth', { ...data, action: 'login' });
export const getMe = () => API.get('/auth');

// User API
export const updateProfile = (data) => API.put('/user', data);
export const uploadAvatar = (formData) => API.post('/user', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Watchlist API
export const getWatchlist = () => API.get('/watchlist');
export const addToWatchlistAPI = (item) => API.post('/watchlist', item);
export const removeFromWatchlistAPI = (itemId) => API.delete(`/watchlist?id=${itemId}`);

export default API;
