import api from './api';

export const analyticsService = {
  async getDashboard() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  async getDetailed(days = 7) {
    const response = await api.get('/analytics/detailed', { params: { days } });
    return response.data;
  }
};
