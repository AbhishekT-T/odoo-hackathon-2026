import apiClient from './client';

export const getFuelLogs = (params) => apiClient.get('/fuel-logs', { params }).then(res => res.data);
export const getFuelLogById = (id) => apiClient.get(`/fuel-logs/${id}`).then(res => res.data);
export const getFuelSummary = () => apiClient.get('/fuel-logs/summary').then(res => res.data);
export const createFuelLog = (data) => apiClient.post('/fuel-logs', data).then(res => res.data);
export const updateFuelLog = (id, data) => apiClient.put(`/fuel-logs/${id}`, data).then(res => res.data);
export const deleteFuelLog = (id) => apiClient.delete(`/fuel-logs/${id}`).then(res => res.data);
