import api from './api';

export const recommendationService = {
  async getRecommendations() {
    const response = await api.get('/recommendations');
    return response.data;
  },

  async toggleRecommendation(id) {
    const response = await api.put(`/recommendations/${id}/toggle`);
    return response.data;
  }
};
