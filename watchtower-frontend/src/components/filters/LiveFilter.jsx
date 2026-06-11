import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function LiveFilter({ filters, setFilter, resetFilters }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [ipValue, setIpValue] = useState(filters.ip || '');
  
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedIp = useDebounce(ipValue, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) setFilter('search', debouncedSearch);
    if (debouncedIp !== filters.ip) setFilter('ip', debouncedIp);
  }, [debouncedSearch, debouncedIp, filters, setFilter]);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Filter className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Filter Live Infrastructure</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* جستجوی ساب‌دامین */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
          />
        </div>

        {/* فیلتر IP */}
        <input
          type="text"
          placeholder="Filter by Exact IP..."
          value={ipValue}
          onChange={(e) => setIpValue(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />

        {/* وضعیت CDN */}
        <select
          value={filters.has_cdn || ''}
          onChange={(e) => setFilter('has_cdn', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        >
          <option value="">Has CDN? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        {/* نام CDN */}
        <input
          type="text"
          placeholder="CDN Name (e.g. cloudflare)..."
          value={filters.cdn || ''}
          onChange={(e) => setFilter('cdn', e.target.value)}
          disabled={filters.has_cdn === 'false'}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border mt-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={filters.has_http === 'true'}
              onChange={(e) => setFilter('has_http', e.target.checked ? 'true' : '')}
              className="rounded border-border bg-background text-accent focus:ring-accent/50"
            />
            Has HTTP Service
          </label>
        </div>

        <button
          onClick={() => {
            setSearchValue('');
            setIpValue('');
            resetFilters();
          }}
          className="flex items-center gap-1.5 text-sm text-primary-muted hover:text-danger transition-colors px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}