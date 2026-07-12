import apiClient from './client';

export const getReportsData = () => apiClient.get('/reports/analytics').then(res => res.data);
export const getFleetSummary = () => apiClient.get('/reports/fleet-summary').then(res => res.data);
