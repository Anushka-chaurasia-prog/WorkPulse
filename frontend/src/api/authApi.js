import apiClient from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  getHealth: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};

export default authApi;
