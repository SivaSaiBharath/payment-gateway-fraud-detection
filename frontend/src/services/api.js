import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090').replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export function getErrorMessage(error) {
  if (error.response) {
    const body = error.response.data;
    if (typeof body === 'string' && body.trim()) return body;
    if (body?.message) return body.message;
    if (body?.error) return body.error;
    return `Request failed with HTTP ${error.response.status}`;
  }
  if (error.request) return 'Could not reach the backend. Check that Spring Boot is running and the API URL is correct.';
  return error.message || 'Unexpected error';
}

export default api;