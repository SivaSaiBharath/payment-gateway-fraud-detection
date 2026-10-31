import api from './api.js';

export const accountsApi = {
  list: () => api.get('/listOfAcc'),
  getById: (id) => api.get(`/getAccById/${encodeURIComponent(id)}`),
  create: (payload) => api.post('/acc', payload),
};