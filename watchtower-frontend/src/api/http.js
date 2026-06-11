import { apiClient } from './client';

export const getHttpServices = async (params) => {
  return await apiClient.get('/http', { params });
};
