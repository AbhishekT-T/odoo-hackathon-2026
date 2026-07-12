import apiClient from './client';

export const getDocuments = (entityType, entityId) => 
  apiClient.get(`/documents?entity_type=${entityType}&entity_id=${entityId}`).then(res => res.data);

export const createDocument = (data) => 
  apiClient.post('/documents', data).then(res => res.data);

export const deleteDocument = (id) => 
  apiClient.delete(`/documents/${id}`).then(res => res.data);
