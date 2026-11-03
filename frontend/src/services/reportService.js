import api from './api';

export const reportService = {
  async getSummary(days = 30) {
    const response = await api.get('/reports/summary', { params: { days } });
    return response.data;
  },

  async downloadCSV() {
    const response = await api.get('/reports/export', {
      params: { format: 'csv' },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `safenet_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async downloadJSON() {
    const response = await api.get('/reports/export', {
      params: { format: 'json' }
    });
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safenet_data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};
