import React from 'react';
import { ExternalLink, Database, Globe } from 'lucide-react';
import { getStatusCodeColor, getCdnColor } from '../../utils/colors';

export default function AssetTable({ data }) {
  if (!data?.data || data.data.length === 0) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'both':
        return <span className="px-2.5 py-1 text-[10px] rounded-full font-bold bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/20">FULLY ALIVE</span>;
      case 'http_only':
        return <span className="px-2.5 py-1 text-[10px] rounded-full font-bold bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20">HTTP ONLY</span>;
      case 'live_only':
        return <span className="px-2.5 py-1 text-[10px] rounded-full font-bold bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/20">LIVE ONLY</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] rounded-full font-bold bg-background text-primary-muted border border-border">DEAD / UNKNOWN</span>;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-primary">
          <thead className="text-xs text-primary-muted uppercase bg-surface/50 backdrop-blur-md border-b border-border">
            <tr>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Subdomain</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">HTTP Info</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Infrastructure</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors duration-200 group/row">
                <td className="px-5 py-4 font-medium text-primary max-w-[200px] truncate" title={row.subdomain}>
                  {row.subdomain}
                </td>
                <td className="px-5 py-4">
                  {row.http ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${getStatusCodeColor(row.http.status_code)}`}>
                          {row.http.status_code}
                        </span>
                        <a href={row.http.url} target="_blank" rel="noreferrer" className="text-accent hover:text-accent/80 hover:underline flex items-center gap-1.5 text-xs truncate max-w-[200px] transition-colors">
                          <Globe className="w-3 h-3" />
                          {row.http.url}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-primary-muted/50 italic font-medium">No HTTP service</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {row.live ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-primary-muted">
                        <Database className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{row.live.ips?.[0]}</span>
                        {row.live.ips?.length > 1 && (
                          <span className="bg-border/50 px-1 rounded text-[10px] text-primary">+{row.live.ips.length - 1}</span>
                        )}
                      </div>
                      {row.live.cdn && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md w-max uppercase tracking-wider font-bold ${getCdnColor(row.live.cdn)}`}>
                          {row.live.cdn}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-primary-muted/50 italic font-medium">No Live infra</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {getStatusBadge(row.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}