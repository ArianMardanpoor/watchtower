import React from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';
import { formatDate } from '../../utils/format';
import { getProviderColor } from '../../utils/colors';

export default function SubdomainTable({ data, isLoading }) {
  const { hasCopied, copyToClipboard } = useClipboard();
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (text, id) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-surface border border-border rounded-lg animate-pulse flex justify-center items-center">
        <div className="text-primary-muted text-sm">Loading data...</div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-full p-10 bg-surface border border-border rounded-lg text-center text-primary-muted text-sm">
        No subdomains found with current filters.
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
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Providers</th>
              <th className="px-4 py-3">Discovered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span 
                      className="cursor-pointer hover:text-accent transition-colors"
                      onClick={() => handleCopy(row.subdomain, idx)}
                    >
                      {row.subdomain}
                    </span>
                    {copiedId === idx ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy 
                        className="w-3.5 h-3.5 text-primary-muted cursor-pointer hover:text-primary opacity-0 hover:opacity-100 transition-opacity" 
                        onClick={() => handleCopy(row.subdomain, idx)}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-primary-muted">{row.program_name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.providers?.map((provider) => (
                      <span 
                        key={provider} 
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold border border-border/50 ${getProviderColor(provider)}`}
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-primary-muted">
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