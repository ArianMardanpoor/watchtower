import React from 'react';
import { Globe, Server, Radio, Shield, ExternalLink } from 'lucide-react';
import { getStatusCodeColor, getProviderColor, getCdnColor } from '../../utils/colors';
import { formatDate } from '../../utils/format';

export default function AssetCard({ asset }) {
  const { subdomain, status, live, http, providers, created_date } = asset;

  const statusConfig = {
    both: { border: 'border-success', bg: 'bg-success/5', label: 'HTTP & Live', text: 'text-success' },
    http_only: { border: 'border-warning', bg: 'bg-warning/5', label: 'HTTP Only', text: 'text-warning' },
    live_only: { border: 'border-accent', bg: 'bg-accent/5', label: 'Live Only', text: 'text-accent' },
    none: { border: 'border-border', bg: 'bg-surface', label: 'No Response', text: 'text-primary-muted' },
  };

  const currentStatus = statusConfig[status] || statusConfig.none;

  return (
    <div className={`group border rounded-xl p-5 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${currentStatus.border} ${currentStatus.bg}`}>
      
      {/* هدر */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-bold text-primary truncate max-w-[65%]" title={subdomain}>
          {subdomain}
        </h3>
        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border bg-background shadow-sm ${currentStatus.text} ${currentStatus.border} opacity-80`}>
          {currentStatus.label}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {/* بخش HTTP */}
        {http ? (
          <div className="bg-background rounded-lg p-3.5 border border-border/40 shadow-sm transition-colors group-hover:border-border/80">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-warning" />
              <a href={http.url} target="_blank" rel="noreferrer" className="text-accent hover:text-accent/80 hover:underline flex items-center gap-1.5 truncate font-semibold text-sm transition-colors">
                {http.url} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-primary-muted truncate mb-3" title={http.title}>
              {http.title || 'No Title Provided'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${getStatusCodeColor(http.status_code)}`}>
                {http.status_code || 'N/A'}
              </span>
              {http.tech?.slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-badge/50 text-primary-muted border border-border/50">
                  {t}
                </span>
              ))}
              {http.tech?.length > 3 && (
                <span className="text-[10px] font-medium text-primary-muted/70 bg-background px-1.5 py-0.5 rounded border border-dashed border-border/50">
                  +{http.tech.length - 3}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-background/40 rounded-lg p-3 border border-dashed border-border/40 text-xs text-primary-muted/70 flex items-center gap-2 justify-center">
            <Server className="w-3.5 h-3.5" /> No HTTP Service
          </div>
        )}

        {/* بخش Live */}
        {live ? (
          <div className="bg-background rounded-lg p-3.5 border border-border/40 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-primary">
              <Radio className="w-4 h-4 text-success animate-pulse" />
              <span className="font-mono text-xs truncate max-w-[80%] bg-surface px-1.5 py-0.5 rounded text-primary-muted">
                {live.ips?.join(', ')}
              </span>
            </div>
            {live.cdn && (
              <div className="flex">
                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md uppercase font-bold border ${getCdnColor(live.cdn)}`}>
                  <Shield className="w-3 h-3" /> {live.cdn}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-background/40 rounded-lg p-3 border border-dashed border-border/40 text-xs text-primary-muted/70 flex items-center gap-2 justify-center">
            <Radio className="w-3.5 h-3.5" /> No DNS/IP
          </div>
        )}
      </div>

      {/* فوتر کارت */}
      <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-[11px] font-medium">
        <div className="flex gap-1.5">
          {providers?.slice(0, 2).map((p) => (
            <span key={p} className={`px-2 py-0.5 rounded-md uppercase tracking-wider ${getProviderColor(p)}`}>
              {p}
            </span>
          ))}
        </div>
        <span className="text-primary-muted/80">
          {formatDate(created_date)}
        </span>
      </div>
    </div>
  );
}