import axiosClient from './axiosClient';

// Auth endpoints
// POST /auth/register, POST /auth/login, GET /auth/me
const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  me: () => axiosClient.get('/auth/me'),
};

export default authApi;
