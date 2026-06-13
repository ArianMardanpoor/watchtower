import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function LiveFilter({ filters, setFilter, resetFilters }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [ipValue, setIpValue] = useState(filters.ip || '');
  const [cdnValue, setCdnValue] = useState(filters.cdn || '');
  
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedIp = useDebounce(ipValue, 500);
  const debouncedCdn = useDebounce(cdnValue, 500);

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) setFilter('search', debouncedSearch);
    if (debouncedIp !== (filters.ip || '')) setFilter('ip', debouncedIp);
    if (debouncedCdn !== (filters.cdn || '')) setFilter('cdn', debouncedCdn);
  }, [debouncedSearch, debouncedIp, debouncedCdn, filters, setFilter]);

  const handleReset = () => {
    setSearchValue('');
    setIpValue('');
    setCdnValue('');
    resetFilters();
  };

  const inputClasses = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-primary-muted focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all duration-200 hover:border-primary-muted/50";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-primary border-b border-border/50 pb-3">
        <Filter className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold">Filter Live Infrastructure</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`${inputClasses} pl-9`}
          />
        </div>

        <input
          type="text"
          placeholder="Exact IP Address..."
          value={ipValue}
          onChange={(e) => setIpValue(e.target.value)}
          className={inputClasses}
        />

        <select
          value={filters.has_cdn || ''}
          onChange={(e) => {
            setFilter('has_cdn', e.target.value);
            if (e.target.value === 'false') {
              setCdnValue('');
              setFilter('cdn', '');
            }
          }}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option value="">Has CDN? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <input
          type="text"
          placeholder="CDN Name (e.g. cloudflare)..."
          value={cdnValue}
          onChange={(e) => setCdnValue(e.target.value)}
          disabled={filters.has_cdn === 'false'}
          className={`${inputClasses} disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-4">
          <label className="flex items-center gap-2.5 text-sm text-primary cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.has_http === 'true'}
              onChange={(e) => setFilter('has_http', e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent/50 focus:ring-2 cursor-pointer transition-all"
            />
            <span className="group-hover:text-accent transition-colors">Has HTTP Service</span>
          </label>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-primary-muted hover:text-danger hover:bg-danger/10 transition-colors px-3 py-1.5 rounded-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}