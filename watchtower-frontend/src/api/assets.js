import { apiClient } from './client';

export const getAssets = async (params) => {
  return await apiClient.get('/assets', { params });
};