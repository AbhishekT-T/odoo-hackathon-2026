import apiClient from './client';

export const getTrips = () => apiClient.get('/trips').then(res => res.data);
export const getTripById = (id) => apiClient.get(`/trips/${id}`).then(res => res.data);
export const createTrip = (data) => apiClient.post('/trips', data).then(res => res.data);
export const updateTrip = (id, data) => apiClient.put(`/trips/${id}`, data).then(res => res.data);
export const deleteTrip = (id) => apiClient.delete(`/trips/${id}`).then(res => res.data);

// Custom status transitions
export const dispatchTrip = (id) => apiClient.post(`/trips/${id}/dispatch`).then(res => res.data);
export const completeTrip = (id, data) => apiClient.post(`/trips/${id}/complete`, data).then(res => res.data);
export const cancelTrip = (id) => apiClient.post(`/trips/${id}/cancel`).then(res => res.data);
