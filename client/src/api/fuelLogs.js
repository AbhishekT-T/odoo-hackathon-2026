import apiClient from './client';

export const getFuelLogs = () => apiClient.get('/fuel-logs').then(res => res.data);
export const getFuelLogById = (id) => apiClient.get(`/fuel-logs/${id}`).then(res => res.data);
export const createFuelLog = (data) => apiClient.post('/fuel-logs', data).then(res => res.data);
export const updateFuelLog = (id, data) => apiClient.put(`/fuel-logs/${id}`, data).then(res => res.data);
export const deleteFuelLog = (id) => apiClient.delete(`/fuel-logs/${id}`).then(res => res.data);
