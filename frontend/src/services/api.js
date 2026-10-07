import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inventory_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired (except when already on login page)
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('inventory_token');
        localStorage.removeItem('inventory_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Product Services
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) =>
    api.post('/products', formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    }),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stockData) => api.patch(`/products/${id}/stock`, stockData),
};

// Category Services
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Dashboard & Analytics Services
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getStockLogs: (params) => api.get('/dashboard/stock-logs', { params }),
};

export default api;
