import { apiClient } from './client';

export const getProviders = async (params) => apiClient.get('/meta/providers', { params });
export const getTechs = async (params) => apiClient.get('/meta/techs', { params });
export const getCdns = async (params) => apiClient.get('/meta/cdns', { params });
export const getScopes = async (params) => apiClient.get('/meta/scopes', { params });
export const getIps = async (params) => apiClient.get('/meta/ips', { params });