import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Properties API
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/owner/my-properties'),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
};

// Reviews API
export const reviewsAPI = {
  getByProperty: (propertyId) => api.get(`/reviews/property/${propertyId}`),
  create: (data) => api.post('/reviews', data),
  reply: (id, data) => api.put(`/reviews/${id}/reply`, data),
};

// Payments API
export const paymentsAPI = {
  khalti: (data) => api.post('/payments/khalti', data),
  esewa: (data) => api.post('/payments/esewa', data),
  stripe: (data) => api.post('/payments/stripe', data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (id, data) => api.put(`/admin/users/${id}/verify`, data),
  getProperties: (params) => api.get('/admin/properties', { params }),
  approveProperty: (id, data) => api.put(`/admin/properties/${id}/approve`, data),
  getBookings: (params) => api.get('/admin/bookings', { params }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadDocuments: (data) => api.post('/users/verify-documents', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;




