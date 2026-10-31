import api from './api.js';

const BASE = '/api/v1/merchants';

export const merchantsApi = {
  list: () => api.get(BASE),
  getById: (merchantId) => api.get(`${BASE}/${encodeURIComponent(merchantId)}`),
  register: (payload) => api.post(`${BASE}/register`, payload),
};