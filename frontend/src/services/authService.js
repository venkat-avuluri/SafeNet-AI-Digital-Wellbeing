import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('safenet_token', response.data.token);
      localStorage.setItem('safenet_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('safenet_token', response.data.token);
      localStorage.setItem('safenet_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('safenet_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('safenet_token');
    localStorage.removeItem('safenet_user');
  }
};
