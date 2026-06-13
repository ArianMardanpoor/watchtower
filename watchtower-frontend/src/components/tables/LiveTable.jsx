import React, { useState } from 'react';
import { Copy, Check, Shield, SearchX } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';
import { formatDate } from '../../utils/format';
import { getCdnColor } from '../../utils/colors';

export default function LiveTable({ data, isLoading }) {
  const { copyToClipboard } = useClipboard();
  const [copiedText, setCopiedText] = useState(null);

  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-border/20 border-b border-border/50"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-border/20 flex items-center px-5 gap-4"></div>
        ))}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-full py-16 bg-surface border border-border rounded-xl text-center flex flex-col items-center justify-center gap-3">
        <SearchX className="w-10 h-10 text-primary-muted/30" />
        <div className="text-primary-muted text-sm font-medium">No live subdomains found with current filters.</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-primary">
          <thead className="text-xs text-primary-muted uppercase bg-surface/50 backdrop-blur-md border-b border-border">
            <tr>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Subdomain</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider w-64">Resolved IPs</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">CDN / WAF</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Program</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Last Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors duration-200 group/row">
                <td className="px-5 py-4 font-semibold text-primary">
                  {row.subdomain}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {row.ips?.map((ip) => (
                      <div 
                        key={ip} 
                        className="flex items-center gap-1.5 group/ip bg-background/50 border border-border px-2 py-1 rounded-md text-[11px] font-mono shadow-sm transition-colors hover:border-accent/30"
                      >
                        <span className="text-primary-muted group-hover/ip:text-primary transition-colors">{ip}</span>
                        {copiedText === ip ? (
                          <Check className="w-3 h-3 text-[#3fb950]" />
                        ) : (
                          <Copy 
                            className="w-3 h-3 text-primary-muted/50 cursor-pointer opacity-0 group-hover/ip:opacity-100 hover:text-accent transition-all" 
                            onClick={() => handleCopy(ip)}
                            title="Copy IP"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {row.cdn ? (
                    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-bold border border-border/50 shadow-sm ${getCdnColor(row.cdn)}`}>
                      <Shield className="w-3 h-3" />
                      {row.cdn}
                    </span>
                  ) : (
                    <span className="text-xs text-primary-muted/50 italic font-medium">-</span>
                  )}
                </td>
                <td className="px-5 py-4 text-primary-muted text-sm font-medium">
                  {row.program_name}
                </td>
                <td className="px-5 py-4 text-xs text-primary-muted font-mono">
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