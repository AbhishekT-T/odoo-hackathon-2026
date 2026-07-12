import apiClient from './client';

export const getReportsData = () => apiClient.get('/reports/analytics').then(res => res.data);
