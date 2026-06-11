import { apiClient } from './client';

export const getLiveSubdomains = async (params) => {
  return await apiClient.get('/lives', { params });
};
