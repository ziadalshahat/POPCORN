import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// User API
export const updateProfile = (data) => API.put('/user/profile', data);
export const uploadAvatar = (formData) => API.post('/user/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Watchlist API
export const getWatchlist = () => API.get('/watchlist');
export const addToWatchlistAPI = (item) => API.post('/watchlist', item);
export const removeFromWatchlistAPI = (itemId) => API.delete(`/watchlist/${itemId}`);

export default API;
