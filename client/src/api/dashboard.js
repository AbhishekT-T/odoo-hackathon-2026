import apiClient from './client';

export const getDashboardKPIs = () => apiClient.get('/dashboard/kpis').then(res => res.data);
