import axiosClient from './axiosClient';

// Issue endpoints
// GET /issues, PUT /issues/:id/assign, POST /issues/:id/maintenance,
// PUT /issues/:id/status, PUT /issues/:id/reopen
const issueApi = {
  list: (params) => axiosClient.get('/issues', { params }),
  stats: () => axiosClient.get('/issues/stats'),
  getById: (id) => axiosClient.get(`/issues/${id}`),
  assign: (id, data) => axiosClient.put(`/issues/${id}/assign`, data),
  addMaintenance: (id, data) => axiosClient.post(`/issues/${id}/maintenance`, data),
  updateStatus: (id, data) => axiosClient.put(`/issues/${id}/status`, data),
  reopen: (id, data) => axiosClient.put(`/issues/${id}/reopen`, data),
};

export default issueApi;
