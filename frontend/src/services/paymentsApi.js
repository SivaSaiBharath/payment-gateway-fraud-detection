import api from './api.js';

const BASE = '/api/v1/Payments';

export const paymentsApi = {
  create: (payload) => api.post(`${BASE}/payment`, payload),
  getById: (paymentId) => api.get(`${BASE}/${encodeURIComponent(paymentId)}`),
  listByMerchant: (merchantId) => api.get(`${BASE}/merchant/${encodeURIComponent(merchantId)}`),
};