import { apiClient } from './client';

const cleanParams = (params) => {
  return Object.entries(params)
    .filter(([_, value]) => value !== '' && value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSubdomains = async (params) => {
  return await apiClient.get('/subdomains', { params: cleanParams(params) });
};