import { apiClient } from './client';

const cleanParams = (params) => {
  return Object.entries(params)
    .filter(([_, value]) => value !== '' && value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const globalSearch = async (params) => {
  return await apiClient.get('/search', { params: cleanParams(params) });
};