import { apiClient } from './client';

export const getPrograms = async (params) => {
  return await apiClient.get('/programs', { params });
};

export const getProgramDetails = async (programName) => {
  return await apiClient.get(`/programs/${programName}`);
};