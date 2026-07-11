import axiosClient from './axiosClient';

// Asset endpoints
// POST /assets, GET /assets, GET /assets/:id, PUT /assets/:id,
// GET /assets/:id/qr, GET /assets/:id/label, GET /assets/:id/history
const assetApi = {
  create: (data) => axiosClient.post('/assets', data),
  list: (params) => axiosClient.get('/assets', { params }),
  stats: () => axiosClient.get('/assets/stats'),
  getById: (id) => axiosClient.get(`/assets/${id}`),
  update: (id, data) => axiosClient.put(`/assets/${id}`, data),
  getQr: (id, config) => axiosClient.get(`/assets/${id}/qr`, config),
  getLabel: (id, config) => axiosClient.get(`/assets/${id}/label`, config),
  getHistory: (id) => axiosClient.get(`/assets/${id}/history`),
};

export default assetApi;
