import api from './api.js';

const BASE = '/Api/transaction';

export const transactionsApi = {
  create: (payload) => api.post(BASE, payload),
  list: (flagged) => api.get(BASE, { params: flagged === '' || flagged == null ? {} : { flagged } }),
  getById: (id) => api.get(`${BASE}/${encodeURIComponent(id)}`),
};