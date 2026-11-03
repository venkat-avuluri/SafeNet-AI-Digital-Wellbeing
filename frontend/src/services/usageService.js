import api from './api';

export const usageService = {
  async logUsage(data) {
    const response = await api.post('/usage', data);
    return response.data;
  },

  async getRecords(params = {}) {
    const response = await api.get('/usage', { params });
    return response.data;
  },

  async deleteRecord(id) {
    const response = await api.delete(`/usage/${id}`);
    return response.data;
  },

  async seedDemoData() {
    const response = await api.post('/usage/seed-demo');
    return response.data;
  },

  async clearAllData() {
    const response = await api.delete('/usage/clear-all');
    return response.data;
  }
};
