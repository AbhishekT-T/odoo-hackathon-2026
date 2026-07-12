import apiClient from './client';

export const getVehicles = () => apiClient.get('/vehicles').then(res => res.data);
export const getVehicleById = (id) => apiClient.get(`/vehicles/${id}`).then(res => res.data);
export const createVehicle = (data) => apiClient.post('/vehicles', data).then(res => res.data);
export const updateVehicle = (id, data) => apiClient.put(`/vehicles/${id}`, data).then(res => res.data);
export const deleteVehicle = (id) => apiClient.delete(`/vehicles/${id}`).then(res => res.data);
