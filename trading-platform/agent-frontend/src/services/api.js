import axios from 'axios';

const API_URL = 'https://api.goldxgo.com/api';

// Create axios instance for agent
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agentToken');
      localStorage.removeItem('agentData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const agentAuthService = {
  login: (credentials) => api.post('/auth/agent/login', credentials),
  changePassword: async (data) => {
    const response = await api.post('/auth/agent/change-password', data);
    return response.data;
  }
};

export default api;