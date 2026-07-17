import axiosClient from './axiosClient';

// Auth endpoints
// POST /auth/register, POST /auth/login, GET /auth/me,
// PUT /auth/me (profile), PUT /auth/me/password
const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  me: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/me', data),
  changePassword: (data) => axiosClient.put('/auth/me/password', data),
};

export default authApi;
