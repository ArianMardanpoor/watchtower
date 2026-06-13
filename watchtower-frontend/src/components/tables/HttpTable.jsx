import React from 'react';
import { ExternalLink, Globe, SearchX } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { getProviderColor, getStatusCodeColor } from '../../utils/colors';

export default function HttpTable({ data, isLoading }) {
  const getFallbackFavicon = (url) => {
    try {
      const host = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-border/20 border-b border-border/50"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-border/20 flex items-center px-5 gap-4">
            <div className="w-4 h-4 bg-border/50 rounded"></div>
            <div className="w-48 h-4 bg-border/50 rounded"></div>
            <div className="w-24 h-4 bg-border/50 rounded ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-full py-16 bg-surface border border-border rounded-xl text-center flex flex-col items-center justify-center gap-3">
        <SearchX className="w-10 h-10 text-primary-muted/30" />
        <div className="text-primary-muted text-sm font-medium">No HTTP services found with current filters.</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-primary">
          <thead className="text-xs text-primary-muted uppercase bg-surface/50 backdrop-blur-md border-b border-border">
            <tr>
              <th className="px-5 py-3.5 font-semibold tracking-wider w-12">Fav</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">URL & Title</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Provider</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Status</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider max-w-[200px]">Technologies</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors duration-200 group/row">
                <td className="px-5 py-4">
                  {row.favicon || row.url ? (
                    <img
                      src={row.favicon || getFallbackFavicon(row.url)}
                      alt=""
                      className="w-4 h-4 rounded-sm shadow-sm bg-background"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4Yjk0OWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAyYTE1LjMgMTUuMyAwIDAgMSw0IDEwIDE1LjMgMTUuMyAwIDAgMS00IDEwIDE1LjMgMTUuMyAwIDAgMS00LTEwIDE1LjMgMTUuMyAwIDAgMSw0LTEweiIvPjwvc3ZnPg=='; // Fallback Globe Icon
                      }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-primary-muted" />
                  )}
                </td>
                <td className="px-5 py-4 max-w-[250px]">
                  <div className="flex flex-col gap-1">
                    <a 
                      href={row.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-primary font-semibold hover:text-accent transition-colors flex items-center gap-1.5 truncate"
                    >
                      {row.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-accent" />
                    </a>
                    <span className="text-xs text-primary-muted truncate font-medium" title={row.title}>
                      {row.title || 'No Title'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(row.providers) && row.providers.length > 0 ? (
                      row.providers.map((provider) => (
                        <span key={provider} className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border border-border/50 shadow-sm ${getProviderColor(provider)}`}>
                          {provider}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border border-border/50 bg-background text-primary-muted shadow-sm">
                        Unknown
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-[11px] font-bold rounded-md shadow-sm border border-border/50 ${getStatusCodeColor(row.status_code)}`}>
                    {row.status_code || 'N/A'}
                  </span>
                </td>
                <td className="px-5 py-4 max-w-[200px]">
                  <div className="flex flex-wrap gap-1">
                    {row.tech?.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-background text-primary border border-border shadow-sm truncate max-w-[80px]" title={t}>
                        {t}
                      </span>
                    ))}
                    {row.tech?.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/10 text-accent font-bold border border-accent/20 shadow-sm">
                        +{row.tech.length - 4}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-primary-muted font-mono">
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