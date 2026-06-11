import React from 'react';
import { Copy, Check, Shield } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';
import { formatDate } from '../../utils/format';
import { getCdnColor } from '../../utils/colors';

export default function LiveTable({ data, isLoading }) {
  const { hasCopied, copyToClipboard } = useClipboard();
  const [copiedText, setCopiedText] = React.useState(null);

  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-surface border border-border rounded-lg animate-pulse flex justify-center items-center">
        <div className="text-primary-muted text-sm">Loading Live Infrastructure...</div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-full p-10 bg-surface border border-border rounded-lg text-center text-primary-muted text-sm">
        No live subdomains found with current filters.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-primary">
          <thead className="text-xs text-primary-muted uppercase bg-background border-b border-border">
            <tr>
              <th className="px-4 py-3">Subdomain</th>
              <th className="px-4 py-3 w-64">Resolved IPs</th>
              <th className="px-4 py-3">CDN / WAF</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Last Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 font-medium text-accent">
                  {row.subdomain}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.ips?.map((ip) => (
                      <div 
                        key={ip} 
                        className="flex items-center gap-1 group bg-background border border-border/50 px-1.5 py-0.5 rounded text-[11px] font-mono"
                      >
                        {ip}
                        {copiedText === ip ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy 
                            className="w-3 h-3 text-primary-muted cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" 
                            onClick={() => handleCopy(ip)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {row.cdn ? (
                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold border border-border/50 ${getCdnColor(row.cdn)}`}>
                      <Shield className="w-3 h-3" />
                      {row.cdn}
                    </span>
                  ) : (
                    <span className="text-xs text-primary-muted">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-primary-muted">{row.program_name}</td>
                <td className="px-4 py-3 text-xs text-primary-muted">
                  {formatDate(row.last_update)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}