import API from './auth';

// Admin API calls
export const getAdminUsers = () => API.get('/admin/users');
export const getAdminLogins = () => API.get('/admin/logins');
export const getAdminStats = () => API.get('/admin/stats');
export const deleteAdminUser = (id) => API.delete(`/admin/user?id=${id}`);
