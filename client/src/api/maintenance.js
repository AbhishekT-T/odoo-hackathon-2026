import apiClient from './client';

export const getMaintenances = () => apiClient.get('/maintenance').then(res => res.data);
export const getMaintenanceById = (id) => apiClient.get(`/maintenance/${id}`).then(res => res.data);
export const createMaintenance = (data) => apiClient.post('/maintenance', data).then(res => res.data);
export const updateMaintenance = (id, data) => apiClient.put(`/maintenance/${id}`, data).then(res => res.data);
export const deleteMaintenance = (id) => apiClient.delete(`/maintenance/${id}`).then(res => res.data);
