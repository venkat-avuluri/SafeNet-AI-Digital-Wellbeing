import api from './api';

export const mlService = {
  async triggerAssessment() {
    const response = await api.post('/ml/assess');
    return response.data;
  },

  async simulateAssessment(customFeatures) {
    const response = await api.post('/ml/simulate', customFeatures);
    return response.data;
  },

  async getHistory() {
    const response = await api.get('/ml/history');
    return response.data;
  },

  async getLatest() {
    const response = await api.get('/ml/latest');
    return response.data;
  },

  async getStatus() {
    const response = await api.get('/ml/status');
    return response.data;
  }
};
