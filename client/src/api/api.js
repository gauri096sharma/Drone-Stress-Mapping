import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getRecords = (userId) =>
  api.get(`/records?userId=${userId}`);

export const createRecord = (payload, userId) =>
  api.post('/records', {
    ...payload,
    userId
  });

export const updateRecord = (id, payload, userId) =>
  api.put(`/records/${id}`, {
    ...payload,
    userId
  });

export const deleteRecord = (id) =>
  api.delete(`/records/${id}`);

export const getAnalytics = () =>
  api.get('/analytics/summary');

export default api;