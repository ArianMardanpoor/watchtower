import React, { useState } from 'react';
import { Copy, Check, SearchX } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';
import { formatDate } from '../../utils/format';
import { getProviderColor } from '../../utils/colors';

export default function SubdomainTable({ data, isLoading }) {
  const { copyToClipboard } = useClipboard();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-border/20 border-b border-border/50"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 border-b border-border/20 flex items-center px-5 gap-4"></div>
        ))}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-full py-16 bg-surface border border-border rounded-xl text-center flex flex-col items-center justify-center gap-3">
        <SearchX className="w-10 h-10 text-primary-muted/30" />
        <div className="text-primary-muted text-sm font-medium">No subdomains found with current filters.</div>
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
              <th className="px-5 py-3.5 font-semibold tracking-wider">Program</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Providers</th>
              <th className="px-5 py-3.5 font-semibold tracking-wider">Discovered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors duration-200 group/row">
                <td className="px-5 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    <span 
                      className="cursor-pointer hover:text-accent transition-colors font-semibold"
                      onClick={() => handleCopy(row.subdomain, idx)}
                    >
                      {row.subdomain}
                    </span>
                    {copiedId === idx ? (
                      <Check className="w-4 h-4 text-[#3fb950]" />
                    ) : (
                      <Copy 
                        className="w-4 h-4 text-primary-muted cursor-pointer hover:text-accent opacity-0 group-hover/row:opacity-100 transition-all" 
                        onClick={() => handleCopy(row.subdomain, idx)}
                        title="Copy Subdomain"
                      />
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-primary-muted font-medium">
                  {row.program_name}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {row.providers?.map((provider) => (
                      <span 
                        key={provider} 
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border border-border/50 shadow-sm ${getProviderColor(provider)}`}
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-primary-muted font-mono">
                  {formatDate(row.created_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}