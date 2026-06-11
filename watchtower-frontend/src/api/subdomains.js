import { apiClient } from './client';

export const getSubdomains = async (params) => {
  return await apiClient.get('/subdomains', { params });
};