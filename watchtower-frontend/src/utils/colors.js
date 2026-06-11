export const getStatusCodeColor = (code) => {
  if (!code) return 'bg-gray-500/20 text-gray-400';
  if (code >= 200 && code < 300) return 'bg-success/20 text-success';
  if (code >= 300 && code < 400) return 'bg-accent/20 text-accent';
  if (code >= 400 && code < 500) return 'bg-warning/20 text-warning';
  if (code >= 500) return 'bg-danger/20 text-danger';
  return 'bg-gray-500/20 text-gray-400';
};

export const getProviderColor = (provider) => {
  const colors = {
    subfinder: 'bg-blue-500/20 text-blue-400',
    amass: 'bg-purple-500/20 text-purple-400',
    dnsx: 'bg-teal-500/20 text-teal-400',
    httpx: 'bg-orange-500/20 text-orange-400',
  };
  return colors[provider.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
};
export const getCdnColor = (cdnName) => {
  if (!cdnName) return 'bg-gray-500/20 text-gray-400';
  const name = cdnName.toLowerCase();
  if (name.includes('cloudflare')) return 'bg-orange-500/20 text-orange-400';
  if (name.includes('akamai')) return 'bg-blue-500/20 text-blue-400';
  if (name.includes('fastly')) return 'bg-red-500/20 text-red-400';
  if (name.includes('amazon') || name.includes('aws')) return 'bg-yellow-500/20 text-yellow-400';
  if (name.includes('incapsula') || name.includes('imperva')) return 'bg-indigo-500/20 text-indigo-400';
  
  return 'bg-teal-500/20 text-teal-400'; // Default for other CDNs
};