import apiClient from './client';

export const getDrivers = () => apiClient.get('/drivers').then(res => res.data);
export const getDriverById = (id) => apiClient.get(`/drivers/${id}`).then(res => res.data);
export const createDriver = (data) => apiClient.post('/drivers', data).then(res => res.data);
export const updateDriver = (id, data) => apiClient.put(`/drivers/${id}`, data).then(res => res.data);
export const deleteDriver = (id) => apiClient.delete(`/drivers/${id}`).then(res => res.data);
