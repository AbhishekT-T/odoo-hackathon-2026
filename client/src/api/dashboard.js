import apiClient from './client';

export const getDashboardKPIs = (params) => apiClient.get('/dashboard/kpis', { params }).then(res => res.data);
