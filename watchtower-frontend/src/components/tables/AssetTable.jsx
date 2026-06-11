import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getStatusCodeColor, getCdnColor } from '../../utils/colors';

export default function AssetTable({ data }) {
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-primary">
          <thead className="text-xs text-primary-muted uppercase bg-background border-b border-border">
            <tr>
              <th className="px-4 py-3">Subdomain</th>
              <th className="px-4 py-3">HTTP Info</th>
              <th className="px-4 py-3">Infrastructure</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 font-medium text-primary max-w-[200px] truncate" title={row.subdomain}>
                  {row.subdomain}
                </td>
                <td className="px-4 py-3">
                  {row.http ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${getStatusCodeColor(row.http.status_code)}`}>
                        {row.http.status_code}
                      </span>
                      <a href={row.http.url} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1 text-xs truncate max-w-[150px]">
                        {row.http.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-primary-muted italic">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.live ? (
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-mono text-primary-muted truncate max-w-[150px]">{row.live.ips?.[0]} {row.live.ips?.length > 1 && `(+${row.live.ips.length - 1})`}</span>
                      {row.live.cdn && <span className={`text-[9px] px-1 py-0.5 rounded w-max ${getCdnColor(row.live.cdn)}`}>{row.live.cdn}</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-primary-muted italic">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-[10px] rounded uppercase font-bold border ${row.status === 'both' ? 'text-success border-success/30 bg-success/10' : row.status === 'http_only' ? 'text-warning border-warning/30 bg-warning/10' : row.status === 'live_only' ? 'text-accent border-accent/30 bg-accent/10' : 'text-primary-muted border-border bg-background'}`}>
                    {row.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}