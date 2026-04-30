import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getRecords = () => api.get('/records');
export const createRecord = (payload) => api.post('/records', payload);
export const updateRecord = (id, payload) => api.put(`/records/${id}`, payload);
export const deleteRecord = (id) => api.delete(`/records/${id}`);
export const getAnalytics = () => api.get('/analytics/summary');

export default api;
