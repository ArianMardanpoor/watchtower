import { apiClient } from './client';

export async function getHttpServices(filters: Record<string, any>) {
  return apiClient.get('/http', { params: filters });
}
