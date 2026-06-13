import { apiClient } from './client';

export async function getLiveSubdomains(filters: Record<string, any>) {
  return apiClient.get('/lives', { params: filters });
}

export async function getAssets(filters: Record<string, any>) {
  return apiClient.get('/assets', { params: filters });
}
