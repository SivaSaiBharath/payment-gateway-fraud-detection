import api from './api.js';

const BASE = '/Api/transaction';

export const transactionsApi = {
  create: (payload) => api.post(BASE, payload),

  list: (filters = {}) => api.get(BASE, { params: filters }),

  getById: (id) => api.get(`${BASE}/${encodeURIComponent(id)}`),
};