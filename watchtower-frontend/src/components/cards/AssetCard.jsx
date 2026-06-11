import React from 'react';
import { Globe, Server, Radio, Shield, ExternalLink } from 'lucide-react';
import { getStatusCodeColor, getProviderColor, getCdnColor } from '../../utils/colors';
import { formatDate } from '../../utils/format';

export default function AssetCard({ asset }) {
  const { subdomain, status, live, http, providers, created_date } = asset;

  // تعیین رنگ هدر کارت بر اساس وضعیت
  const statusColors = {
    both: 'border-success bg-success/5',
    http_only: 'border-warning bg-warning/5',
    live_only: 'border-accent bg-accent/5',
    none: 'border-border bg-surface',
  };

  const statusLabels = {
    both: 'HTTP & Live',
    http_only: 'HTTP Only',
    live_only: 'Live Only',
    none: 'No Response',
  };

  return (
    <div className={`border rounded-lg p-4 flex flex-col transition-all hover:shadow-md ${statusColors[status] || statusColors.none}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-primary truncate max-w-[70%]" title={subdomain}>
          {subdomain}
        </h3>
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border bg-background ${status === 'both' ? 'text-success border-success/30' : 'text-primary-muted border-border'}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        {/* بخش HTTP */}
        {http ? (
          <div className="bg-background rounded p-3 border border-border/50 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-warning" />
              <a href={http.url} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1 truncate font-medium">
                {http.url} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-primary-muted truncate mb-2" title={http.title}>
              {http.title || 'No Title'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${getStatusCodeColor(http.status_code)}`}>
                {http.status_code || 'N/A'}
              </span>
              {http.tech?.slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-badge text-primary-muted border border-border/50">
                  {t}
                </span>
              ))}
              {http.tech?.length > 3 && (
                <span className="text-[10px] text-primary-muted">+{http.tech.length - 3} more</span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-background/50 rounded p-3 border border-border/30 text-xs text-primary-muted flex items-center gap-2 italic">
            <Server className="w-3 h-3 opacity-50" /> No HTTP Service detected
          </div>
        )}

        {/* بخش Live / Infrastructure */}
        {live ? (
          <div className="bg-background rounded p-3 border border-border/50 text-sm">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Radio className="w-4 h-4 text-success" />
              <span className="font-mono text-xs truncate max-w-[80%]">{live.ips?.join(', ')}</span>
            </div>
            {live.cdn && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-semibold border border-border/50 ${getCdnColor(live.cdn)}`}>
                <Shield className="w-3 h-3" /> {live.cdn}
              </span>
            )}
          </div>
        ) : (
          <div className="bg-background/50 rounded p-3 border border-border/30 text-xs text-primary-muted flex items-center gap-2 italic">
            <Radio className="w-3 h-3 opacity-50" /> No DNS/IP Resolution
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
        <div className="flex gap-1">
          {providers?.slice(0, 2).map((p) => (
            <span key={p} className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${getProviderColor(p)}`}>{p}</span>
          ))}
        </div>
        <span className="text-primary-muted">Added: {formatDate(created_date)}</span>
      </div>
    </div>
  );
}