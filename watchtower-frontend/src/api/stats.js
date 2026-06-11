import { apiClient } from './client';

export const getGlobalStats = async () => {
  return await apiClient.get('/stats');
};

export const getProgramStats = async (programName) => {
  return await apiClient.get(`/stats/program/${programName}`);
};

export const getTimelineStats = async (params) => {
  return await apiClient.get('/stats/timeline', { params });
};
