import axiosClient from './axiosClient';

// User endpoints (admin only)
// GET /users?role=technician
const userApi = {
  list: (params) => axiosClient.get('/users', { params }),
  technicians: () => axiosClient.get('/users', { params: { role: 'technician' } }),
};

export default userApi;
