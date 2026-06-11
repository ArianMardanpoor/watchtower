import React from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { getProviderColor, getStatusCodeColor } from '../../utils/colors';

export default function HttpTable({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full h-64 bg-surface border border-border rounded-lg animate-pulse flex justify-center items-center">
        <div className="text-primary-muted text-sm">Loading HTTP data...</div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-full p-10 bg-surface border border-border rounded-lg text-center text-primary-muted text-sm">
        No HTTP services found with current filters.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-primary">
          <thead className="text-xs text-primary-muted uppercase bg-background border-b border-border">
            <tr>
              <th className="px-4 py-3 w-10">Fav</th>
              <th className="px-4 py-3">URL & Title</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Technologies</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3">
                  {row.favicon ? (
                     <img src={row.favicon} alt="fav" className="w-4 h-4 rounded-sm" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-border" />
                  )}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex flex-col gap-1">
                    <a 
                      href={row.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-accent hover:text-accent-hover font-medium flex items-center gap-1 truncate"
                    >
                      {row.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <span className="text-xs text-primary-muted truncate" title={row.title}>
                      {row.title || 'No Title'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(row.providers) && row.providers.length > 0 ? (
                      row.providers.map((provider) => (
                        <span
                          key={provider}
                          className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold border border-border/50 ${getProviderColor(provider)}`}
                        >
                          {provider}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold border border-border/50 bg-gray-500/20 text-gray-400">
                        Unknown
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${getStatusCodeColor(row.status_code)}`}>
                    {row.status_code || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.tech?.slice(0, 5).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-badge text-primary-muted border border-border/50">
                        {t}
                      </span>
                    ))}
                    {row.tech?.length > 5 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-background text-primary-muted">
                        +{row.tech.length - 5}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-primary-muted">
                  {formatDate(row.last_update || row.created_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}