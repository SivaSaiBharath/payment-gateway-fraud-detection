import api from './api.js';

const BASE = '/Alerts';

export const alertsApi = {
  list: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${encodeURIComponent(id)}`),
};