import { apiClient } from './client';

export const globalSearch = async (params) => {
  return await apiClient.get('/search', { params });
};