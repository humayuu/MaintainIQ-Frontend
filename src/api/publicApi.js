import axiosClient from './axiosClient';

// Public endpoints (no auth required)
// GET /public/assets/:slug
// POST /public/assets/:slug/issues/triage
// POST /public/assets/:slug/issues
const publicApi = {
  getAsset: (slug) => axiosClient.get(`/public/assets/${slug}`),
  triageIssue: (slug, data) => axiosClient.post(`/public/assets/${slug}/issues/triage`, data),
  submitIssue: (slug, data) => axiosClient.post(`/public/assets/${slug}/issues`, data),
};

export default publicApi;
